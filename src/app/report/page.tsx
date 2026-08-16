"use client";

import { useState, useRef } from "react";
import { FileBarChart, Sparkles, Download, Users, TrendingUp, AlertCircle, Lightbulb, Flag, Clock } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useHistory } from "@/hooks/useHistory";

interface ReportResult {
  attendance: string;
  performance: string;
  issues: string;
  recommendations: string;
  conclusion: string;
  topic?: string;
  date?: string;
}

export default function ReportGenerator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReportResult | null>(null);
  
  const reportRef = useRef<HTMLDivElement>(null);
  const { history, addHistory } = useHistory<ReportResult>("report_history");

  const [formData, setFormData] = useState({
    grade: "",
    subject: "",
    topic: "",
    info: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const toastId = toast.loading("Hisobot yaratilmoqda...");

    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Xatolik yuz berdi");

      const data = await response.json();
      
      const newReport = {
        ...data,
        topic: formData.topic,
        date: new Date().toLocaleString("uz-UZ")
      };
      
      setResult(newReport);
      addHistory(newReport);
      
      toast.success("Hisobot muvaffaqiyatli yaratildi!", { id: toastId });
    } catch (error) {
      toast.error("Xatolik yuz berdi. Qayta urinib ko'ring.", { id: toastId });
    } finally {
      setLoading(false);
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
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`hisobot-${formData.topic || "AI"}.pdf`);
      
      toast.success("PDF saqlandi!", { id: toastId });
    } catch (error) {
      toast.error("PDF saqlashda xatolik yuz berdi.", { id: toastId });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center">
          <FileBarChart className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI Hisobot</h1>
          <p className="text-slate-500">Dars natijalari bo'yicha to'liq hisobot yarating</p>
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
                  placeholder="7-B"
                  value={formData.grade}
                  onChange={(e) => setFormData({...formData, grade: e.target.value})}
                />
                <Input 
                  label="Fan"
                  type="text" required
                  placeholder="Matematika"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                />
              </div>
              
              <Input 
                label="Mavzu"
                type="text" required
                placeholder="Kvadrat tenglama"
                value={formData.topic}
                onChange={(e) => setFormData({...formData, topic: e.target.value})}
              />
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Qisqa ma'lumot (davomat, yutuq va kamchiliklar)</label>
                <textarea 
                  required rows={5}
                  placeholder="26 nafar o'quvchidan 24 nafari qatnashdi. 18 tasi yaxshi tushundi. 6 tasiga qo'shimcha yordam kerak..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 resize-none transition-colors"
                  value={formData.info}
                  onChange={(e) => setFormData({...formData, info: e.target.value})}
                ></textarea>
              </div>

              <Button 
                type="submit" 
                className="w-full mt-4"
                isLoading={loading}
                leftIcon={<Sparkles className="w-5 h-5" />}
              >
                {loading ? "Hisobot yaratilmoqda..." : "Hisobot Yaratish"}
              </Button>
            </form>
          </Card>
          
          {history.length > 0 && (
            <Card>
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                Oxirgi Hisobotlar
              </h3>
              <div className="space-y-3">
                {history.map((item, idx) => (
                  <div key={idx} className="flex flex-col p-3 bg-slate-50 rounded-lg border border-slate-100 cursor-pointer hover:border-violet-200 transition-colors" onClick={() => setResult(item)}>
                    <span className="font-medium text-slate-800">{item.topic || "Noma'lum mavzu"}</span>
                    <span className="text-xs text-slate-500">{item.date}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        <Card className="flex flex-col h-full min-h-[500px] !p-0 overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-8 h-full animate-pulse">
              <div className="flex justify-between items-center mb-8">
                <Skeleton className="w-48 h-8" />
                <Skeleton className="w-10 h-10 rounded-lg" />
              </div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                  <div className="space-y-2 w-full">
                    <Skeleton className="w-24 h-4" />
                    <Skeleton className="w-full h-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : result ? (
            <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-500">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                <h2 className="text-xl font-bold text-slate-900">Tayyor Hisobot</h2>
                <button onClick={downloadPDF} className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors" title="PDF yuklab olish">
                  <Download className="w-5 h-5" />
                </button>
              </div>
              
              {/* PDF Content Area */}
              <div ref={reportRef} className="p-6 flex-1 overflow-y-auto space-y-6 bg-white">
                <div className="text-center mb-6 hidden show-in-pdf">
                  <h1 className="text-2xl font-bold text-slate-900">DARS HISOBOTI</h1>
                  <p className="text-slate-600 mt-2">{formData.subject} | {formData.grade}-sinf | {formData.topic || result.topic}</p>
                </div>

                {/* Davomat */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">Davomat</h3>
                    <p className="text-slate-700 text-sm leading-relaxed">{result.attendance}</p>
                  </div>
                </div>

                {/* O'zlashtirish */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">O'zlashtirish</h3>
                    <p className="text-slate-700 text-sm leading-relaxed">{result.performance}</p>
                  </div>
                </div>

                {/* Muammolar */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">Muammolar</h3>
                    <p className="text-slate-700 text-sm leading-relaxed">{result.issues}</p>
                  </div>
                </div>

                {/* Tavsiyalar */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Lightbulb className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">Tavsiyalar</h3>
                    <p className="text-slate-700 text-sm leading-relaxed">{result.recommendations}</p>
                  </div>
                </div>

                {/* Xulosa */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex gap-3">
                  <Flag className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">Umumiy Xulosa</h3>
                    <p className="text-slate-700 text-sm leading-relaxed">{result.conclusion}</p>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center h-full">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <FileBarChart className="w-8 h-8 text-slate-300" />
              </div>
              <p>Chap tomondagi formani to'ldiring va<br/>avtomatik hisobotni oling.</p>
            </div>
          )}
        </Card>
      </div>
      
      {/* Styles for PDF Generation */}
      <style dangerouslySetInnerHTML={{__html: `
        .show-in-pdf { display: none; }
      `}} />
    </div>
  );
}
