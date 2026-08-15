"use client";

import { useState } from "react";
import { FileSignature, Sparkles, Loader2, Download, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import jsPDF from "jspdf";

interface TestQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

export default function TestGenerator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{questions: TestQuestion[]} | null>(null);

  const [formData, setFormData] = useState({
    grade: "",
    subject: "",
    topic: "",
    questionsCount: "5",
    difficulty: "O'rta"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/test-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Xatolik yuz berdi");

      const data = await response.json();
      setResult(data);
    } catch (error) {
      toast.error("Xatolik yuz berdi. Qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!result) return;
    
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("TEST SAVOLLARI", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.text(`Fan: ${formData.subject} | Sinf: ${formData.grade}`, 20, 30);
    doc.text(`Mavzu: ${formData.topic}`, 20, 40);
    
    let yPos = 55;
    
    result.questions.forEach((q, i) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(12);
      const splitQuestion = doc.splitTextToSize(`${i + 1}. ${q.question}`, 170);
      doc.text(splitQuestion, 20, yPos);
      yPos += (splitQuestion.length * 7) + 2;
      
      doc.setFontSize(11);
      q.options.forEach((opt, idx) => {
        const letter = String.fromCharCode(65 + idx);
        doc.text(`${letter}) ${opt}`, 25, yPos);
        yPos += 7;
      });
      
      yPos += 5;
    });
    
    doc.save(`testlar-${formData.topic}.pdf`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
          <FileSignature className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI Test Yaratuvchi</h1>
          <p className="text-slate-500">Istalgan mavzuda bir necha soniyada test savollari tayyorlang</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 h-fit">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fan</label>
              <input 
                type="text" required
                placeholder="Masalan: Biologiya"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sinf</label>
              <input 
                type="text" required
                placeholder="Masalan: 8"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.grade}
                onChange={(e) => setFormData({...formData, grade: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mavzu</label>
              <input 
                type="text" required
                placeholder="Masalan: Yurak"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.topic}
                onChange={(e) => setFormData({...formData, topic: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Savollar</label>
                <input 
                  type="number" required max="20" min="1"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.questionsCount}
                  onChange={(e) => setFormData({...formData, questionsCount: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Qiyinlik</label>
                <select 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.difficulty}
                  onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                >
                  <option value="Oson">Oson</option>
                  <option value="O'rta">O'rta</option>
                  <option value="Qiyin">Qiyin</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {loading ? "Yaratilmoqda..." : "Test yaratish"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[calc(100vh-12rem)]">
          {result ? (
            <div className="flex flex-col h-full animate-in slide-in-from-bottom-4 duration-500">
              <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10 rounded-t-2xl shadow-sm">
                <h2 className="text-xl font-bold text-slate-900">
                  Natija: {result.questions.length} ta savol
                </h2>
                <button onClick={downloadPDF} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 font-medium rounded-lg hover:bg-indigo-100 transition-colors">
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">PDF yuklash</span>
                </button>
              </div>
              
              <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-8 bg-slate-50/50">
                {result.questions.map((q, i) => (
                  <div key={i} className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 rounded-l-xl"></div>
                    <h3 className="text-lg font-medium text-slate-900 mb-4 pl-2 flex gap-3">
                      <span className="text-indigo-500 font-bold">{i + 1}.</span> 
                      {q.question}
                    </h3>
                    
                    <div className="space-y-3 pl-8">
                      {q.options.map((opt, idx) => {
                        const isCorrect = opt === q.correct_answer;
                        return (
                          <div 
                            key={idx} 
                            className={`flex items-center gap-3 p-3 rounded-lg border ${
                              isCorrect 
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-medium' 
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              isCorrect ? 'bg-emerald-200 text-emerald-700' : 'bg-slate-200 text-slate-500'
                            }`}>
                              {String.fromCharCode(65 + idx)}
                            </div>
                            <span>{opt}</span>
                            {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto" />}
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="mt-5 pl-8 text-sm">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg">
                        <span className="font-semibold">Izoh:</span> {q.explanation}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center h-full">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <FileSignature className="w-8 h-8 text-slate-300" />
              </div>
              <p>Chap tomondagi formani to'ldiring va<br/>test savollarini kuting.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
