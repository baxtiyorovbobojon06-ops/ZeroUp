"use client";

import { useState, useRef } from "react";
import { BookOpen, Sparkles, Download, Clock, Target, PenTool, CheckCircle, Upload, X } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useHistory } from "@/hooks/useHistory";

interface LessonPhase {
  phase_name: string;
  duration: number;
  teacher_action: string;
  student_action: string;
}

interface AdvancedLessonPlan {
  title: string;
  image_prompt?: string;
  objectives: string[];
  resources: string[];
  phases: LessonPhase[];
  assessment: string;
  homework: string;
  quiz?: { question: string; options: string[]; correct_answer: string }[];
  date?: string;
  grade?: string;
  subject?: string;
}

export default function LessonPlanner() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AdvancedLessonPlan | null>(null);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  
  const reportRef = useRef<HTMLDivElement>(null);
  const { history, addHistory } = useHistory<AdvancedLessonPlan>("lesson_history");

  const [formData, setFormData] = useState({
    grade: "",
    subject: "",
    topic: "",
    duration: "45",
  });
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    
    const toastId = toast.loading("Dars rejasi yaratilmoqda...");

    try {
      const submitData = new FormData();
      submitData.append("grade", formData.grade);
      submitData.append("subject", formData.subject);
      submitData.append("topic", formData.topic);
      submitData.append("duration", formData.duration);
      if (file) {
        submitData.append("file", file);
      }

      const response = await fetch("/api/lesson-planner", {
        method: "POST",
        body: submitData, // send FormData
      });

      if (!response.ok) {
        throw new Error("Xatolik yuz berdi");
      }

      const data = await response.json();
      const newPlan = {
        ...data,
        grade: formData.grade,
        subject: formData.subject,
        date: new Date().toLocaleString("uz-UZ")
      };
      
      setResult(newPlan);
      addHistory(newPlan);
      toast.success("Dars rejasi tayyor!", { id: toastId });
    } catch (error) {
      toast.error("Xatolik yuz berdi. Qayta urinib ko'ring.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/webp'];
      
      if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.docx')) {
        toast.error("Faqat PDF, Word yoki Rasm (JPG/PNG) yuklash mumkin!");
        e.target.value = '';
        return;
      }
      
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("Fayl hajmi 5MB dan oshmasligi kerak!");
        e.target.value = '';
        return;
      }
      
      setFile(selectedFile);
    } else {
      setFile(null);
    }
  };

  const downloadPDF = async () => {
    if (!reportRef.current) return;
    
    const toastId = toast.loading("PDF yuklab olinmoqda...");
    
    try {
      const elements = reportRef.current.querySelectorAll('.show-in-pdf');
      elements.forEach(el => (el as HTMLElement).style.display = 'block');
      
      const canvas = await html2canvas(reportRef.current, { scale: 2 });
      
      elements.forEach(el => (el as HTMLElement).style.display = 'none');
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // If height is larger than 1 page, jsPDF addImage might get cut off or shrink,
      // but usually html2canvas on long containers results in a long PDF page. 
      // For a better multi-page approach, we stick to standard addImage.
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`dars-rejasi-${result?.title || "AI"}.pdf`);
      
      toast.success("PDF saqlandi!", { id: toastId });
    } catch (error) {
      toast.error("PDF saqlashda xatolik yuz berdi.", { id: toastId });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ilg'or Dars Rejasi</h1>
          <p className="text-slate-500">Kitob, qo'llanma yoki rasm yuklab mukammal reja oling</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Sinf"
                  type="text" required
                  placeholder="Masalan: 7-B"
                  value={formData.grade}
                  onChange={(e) => setFormData({...formData, grade: e.target.value})}
                />
                <Input 
                  label="Fan"
                  type="text" required
                  placeholder="Masalan: Matematika"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                />
              </div>
              
              <Input 
                label="Mavzu"
                type="text" required
                placeholder="Masalan: Kvadrat tenglama"
                value={formData.topic}
                onChange={(e) => setFormData({...formData, topic: e.target.value})}
              />
              
              <Input 
                label="Dars davomiyligi (daqiqa)"
                type="number" required
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Qo'shimcha material (PDF, Word, Rasm) - ixtiyoriy
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-lg bg-slate-50 relative hover:bg-slate-100 transition-colors cursor-pointer group">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-10 w-10 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    <div className="flex text-sm text-slate-600 justify-center">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                        <span>{file ? file.name : "Fayl yuklang"}</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.doc,.docx,image/*" />
                      </label>
                    </div>
                    <p className="text-xs text-slate-500">PDF, Word yoki Rasm (Max: 5MB)</p>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                isLoading={loading}
                leftIcon={<Sparkles className="w-5 h-5" />}
              >
                {loading ? "Yaratilmoqda..." : "Dars yaratish"}
              </Button>
            </form>
          </Card>
          
          {history.length > 0 && (
            <Card>
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                Oxirgi Rejalar
              </h3>
              <div className="space-y-3">
                {history.map((item, idx) => (
                  <div key={idx} className="flex flex-col p-3 bg-slate-50 rounded-lg border border-slate-100 cursor-pointer hover:border-blue-200 transition-colors" onClick={() => setResult(item)}>
                    <span className="font-medium text-slate-800">{item.title || item.subject}</span>
                    <span className="text-xs text-slate-500">{item.date}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        <Card className="flex flex-col h-full min-h-[600px] !p-0 overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-8 h-full animate-pulse">
              <div className="flex justify-between items-center mb-8">
                <Skeleton className="w-48 h-8" />
                <Skeleton className="w-10 h-10 rounded-lg" />
              </div>
              <Skeleton className="w-full h-24 rounded-lg" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton className="w-1/3 h-5" />
                  <Skeleton className="w-full h-16 rounded-lg" />
                </div>
              ))}
            </div>
          ) : result ? (
            <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-500">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 line-clamp-1">{result.title}</h2>
                <button onClick={downloadPDF} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors shrink-0" title="PDF yuklab olish">
                  <Download className="w-5 h-5" />
                </button>
              </div>
              
              <div ref={reportRef} className="p-6 flex-1 overflow-y-auto space-y-8 bg-white">
                <div className="text-center mb-6 hidden show-in-pdf">
                  <h1 className="text-2xl font-bold text-slate-900">DARS REJASI</h1>
                  <p className="text-slate-600 mt-2">{result.subject} | {result.grade}-sinf</p>
                  <h2 className="text-xl font-semibold text-blue-700 mt-4">{result.title}</h2>
                </div>

                {/* AI Image Generation via Pollinations */}
                {result.image_prompt && (
                  <div className="w-full h-64 md:h-80 rounded-2xl overflow-hidden relative shadow-lg group">
                    {/* The image */}
                    <img 
                      src={`https://image.pollinations.ai/prompt/${encodeURIComponent(result.image_prompt)}?width=800&height=400&nologo=true`}
                      alt={result.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent pointer-events-none"></div>
                    <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
                      <p className="text-white/90 text-sm font-medium flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-violet-300" /> AI tomonidan yaratilgan rasm
                      </p>
                    </div>
                  </div>
                )}

                {/* Objectives */}
                <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                  <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" /> Dars Maqsadlari
                  </h3>
                  <ul className="space-y-2">
                    {result.objectives?.map((obj, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="w-4 h-4 text-blue-500 mt-1 shrink-0" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Resources */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Kerakli Jihozlar va Resurslar</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.resources?.map((res, i) => (
                      <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium border border-slate-200">
                        {res}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Phases */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Dars Bosqichlari (Jarayon)</h3>
                  <div className="space-y-4">
                    {result.phases?.map((phase, i) => (
                      <div key={i} className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">{i+1}</span>
                            {phase.phase_name}
                          </h4>
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-sm font-medium flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {phase.duration} daq
                          </span>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 mt-3">
                          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <h5 className="text-xs font-bold text-slate-500 uppercase mb-2">O'qituvchi</h5>
                            <p className="text-sm text-slate-700 leading-relaxed">{phase.teacher_action}</p>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <h5 className="text-xs font-bold text-slate-500 uppercase mb-2">O'quvchi</h5>
                            <p className="text-sm text-slate-700 leading-relaxed">{phase.student_action}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Assessment */}
                <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100">
                  <h3 className="text-sm font-bold text-emerald-900 uppercase tracking-wider mb-2">Baholash Mezoni</h3>
                  <p className="text-emerald-800 text-sm leading-relaxed">{result.assessment}</p>
                </div>

                {/* Homework */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Uyga Vazifa</h3>
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 text-amber-900 flex gap-3">
                    <PenTool className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="text-sm leading-relaxed">{result.homework}</p>
                  </div>
                </div>

                {/* Quiz */}
                {result.quiz && result.quiz.length > 0 && (
                  <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100 flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wider mb-1">Dars Yakuni Testi</h3>
                      <p className="text-indigo-800 text-sm">O'quvchilar bilimini tekshirish uchun jami {result.quiz.length} ta test savoli tayyorlandi.</p>
                    </div>
                    <Button type="button" onClick={() => setIsTestModalOpen(true)} className="!bg-indigo-600 hover:!bg-indigo-700 !text-white shrink-0 px-6">
                      Testlarni ko'rish
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <BookOpen className="w-10 h-10 text-blue-200" />
              </div>
              <h3 className="text-lg font-medium text-slate-600 mb-2">Hali reja yaratilmagan</h3>
              <p className="text-sm">Fayl yuklang va kerakli ma'lumotlarni kiriting.</p>
            </div>
          )}
        </Card>
      </div>
      
      {/* Test Modal */}
      {isTestModalOpen && result?.quiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
              <h2 className="text-lg font-bold text-slate-900">Dars Yakuni Testi ({result.quiz.length} ta savol)</h2>
              <button onClick={() => setIsTestModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6 bg-slate-50 flex-1">
              {result.quiz.map((q, i) => (
                <div key={i} className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <p className="font-bold text-slate-900 mb-3">{i + 1}. {q.question}</p>
                  <div className="space-y-2 pl-2">
                    {q.options.map((opt, idx) => (
                      <div key={idx} className="flex gap-3 text-sm text-slate-700 p-2 rounded-lg hover:bg-slate-50">
                        <span className="font-bold text-slate-400 w-5">{String.fromCharCode(65 + idx)})</span> 
                        <span>{opt}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 text-sm text-emerald-600 font-bold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> To'g'ri javob: {q.correct_answer}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-slate-100 bg-white flex justify-end">
              <Button type="button" onClick={() => setIsTestModalOpen(false)} className="!bg-slate-200 hover:!bg-slate-300 !text-slate-800">
                Yopish
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Styles for PDF Generation */}
      <style dangerouslySetInnerHTML={{__html: `
        .show-in-pdf { display: none; }
      `}} />
    </div>
  );
}
