"use client";

import { useState } from "react";
import { CheckSquare, Sparkles, AlertCircle, CheckCircle2, Upload, ImageIcon, X, Lightbulb, Users, Image as ImageIcon2 } from "lucide-react";
import toast from "react-hot-toast";

import { experimental_useObject as useObject } from '@ai-sdk/react';
import { z } from 'zod';

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const schema = z.object({
  results: z.array(
    z.object({
      student_name: z.string().describe("O'quvchining ismi yoki Rasm tartib raqami"),
      score: z.string().describe("Yakuniy baho (masalan 100/100, 5/5, 80%)"),
      status: z.enum(["To'g'ri", "Xato", "Qisman to'g'ri"]).describe("Javob holati"),
      mistakes: z.array(z.string()).describe("Xatolar ro'yxati (to'g'ri bo'lsa bo'sh qoldiring)"),
      feedback: z.string().describe("O'qituvchi tomonidan qisqacha xulosa va tavsiya"),
    })
  )
});

export default function Grader() {
  const [assignment, setAssignment] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const { object: streamedResult, submit, isLoading, error } = useObject({
    api: '/api/grader',
    schema: schema,
    onFinish: () => {
      toast.success("Barcha rasmlar tekshirib bo'lindi!");
    },
    onError: () => {
      toast.error("Tekshirishda xatolik yuz berdi. Yoki rasmlar juda katta.");
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles = newFiles.filter(f => f.type.startsWith('image/'));
      
      if (validFiles.length !== newFiles.length) {
        toast.error("Iltimos, faqat rasm formatidagi fayllarni yuklang (JPG, PNG)");
      }
      
      setFiles(prev => {
        const total = [...prev, ...validFiles];
        if (total.length > 30) {
          toast.error("Maksimal 30 tagacha rasm yuklash mumkin");
          return total.slice(0, 30);
        }
        return total;
      });
      e.target.value = '';
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      toast.error("Kamida bitta rasm yuklang!");
      return;
    }

    toast.loading("Rasmlar bazaga tayyorlanmoqda...", { id: "graderLoad" });
    
    try {
      const imagePromises = files.map(file => {
        return new Promise<{data: string; mimeType: string}>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve({
            data: (reader.result as string).split(',')[1],
            mimeType: file.type
          });
          reader.readAsDataURL(file);
        });
      });

      const imagesData = await Promise.all(imagePromises);
      toast.dismiss("graderLoad");

      submit({
        assignment,
        images: imagesData
      });
    } catch (err) {
      toast.dismiss("graderLoad");
      toast.error("Rasmlarni o'qishda xatolik");
    }
  };

  const result = streamedResult;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
          <CheckSquare className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ommaviy AI Tekshiruvchi</h1>
          <p className="text-slate-500">Barcha o'quvchilar javoblarini rasmga oling va bittada tekshiring</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_1.5fr] gap-8">
        <div className="space-y-6">
          <Card>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  To'g'ri javob yoki topshiriq sharti
                </label>
                <textarea 
                  required rows={4}
                  placeholder="Masalan: Testning to'g'ri javoblari: 1-A, 2-B, 3-C. Yoki misolning sharti: 5x - 3 = 12..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none transition-colors"
                  value={assignment}
                  onChange={(e) => setAssignment(e.target.value)}
                ></textarea>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="block text-sm font-medium text-slate-700">
                    O'quvchilarning javob varaqalari (Rasmlar)
                  </label>
                  <span className="text-xs font-semibold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                    {files.length} / 30
                  </span>
                </div>
                
                <div className="mt-1 flex justify-center px-6 pt-6 pb-6 border-2 border-emerald-200 border-dashed rounded-xl bg-emerald-50/50 relative hover:bg-emerald-50 transition-colors cursor-pointer group">
                  <div className="space-y-2 text-center">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <ImageIcon2 className="w-6 h-6" />
                    </div>
                    <div className="flex text-sm text-slate-600 justify-center">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent rounded-md font-medium text-emerald-600 hover:text-emerald-500 focus-within:outline-none">
                        <span>Rasmlarni tanlang (Bir nechta)</span>
                        <input id="file-upload" name="file-upload" type="file" multiple className="sr-only" onChange={handleFileChange} accept="image/*" />
                      </label>
                    </div>
                    <p className="text-xs text-slate-500">JPG, PNG formatida</p>
                  </div>
                </div>

                {files.length > 0 && (
                  <div className="mt-4 grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1">
                    {files.map((file, idx) => (
                      <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-square">
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt="preview" 
                          className="w-full h-full object-cover"
                        />
                        <button 
                          type="button" 
                          onClick={() => removeFile(idx)}
                          className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] px-1 py-0.5 truncate text-center">
                          {idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                isLoading={isLoading}
                disabled={files.length === 0}
                leftIcon={<Sparkles className="w-5 h-5" />}
              >
                {isLoading ? "Jonli tahlil qilinmoqda..." : "Barchasini tekshirish"}
              </Button>
            </form>
          </Card>
        </div>

        <Card className="flex flex-col h-full min-h-[600px] !p-0 overflow-hidden bg-slate-50 relative">
          {isLoading && !result && (
            <div className="p-6 flex flex-col items-center justify-center h-full text-slate-500 animate-pulse">
              <div className="relative">
                <Sparkles className="w-12 h-12 mb-4 text-emerald-400 animate-spin" />
                <ImageIcon2 className="w-5 h-5 text-emerald-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="font-medium text-slate-600">Rasmlardagi yozuvlar o'qilmoqda...</p>
              <p className="text-xs text-slate-400 mt-2">Bu jarayon 30 tagacha rasm uchun biroz vaqt olishi mumkin</p>
            </div>
          )}
          
          {result?.results && result.results.length > 0 && (
            <div className="flex flex-col h-full animate-in slide-in-from-bottom-4 duration-500">
              <div className="p-5 border-b border-slate-200 bg-white sticky top-0 z-10 shadow-sm flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-600" />
                  Tekshiruv Natijalari
                </h2>
                <div className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2">
                  {isLoading && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>}
                  Tahlil qilindi: {result.results.length} / {files.length}
                </div>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto space-y-4">
                {result.results.map((item: any, i: number) => (
                  <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
                    <div className="p-4 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between bg-slate-50/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm">
                          {i + 1}
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg">
                          {item?.student_name || <span className="text-slate-300">Ism aniqlanmoqda...</span>}
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {item?.status && (
                          <div className={`px-3 py-1 rounded-md text-xs font-bold ${
                            item.status === "To'g'ri" ? "bg-emerald-100 text-emerald-700" :
                            item.status === "Xato" ? "bg-red-100 text-red-700" :
                            "bg-amber-100 text-amber-700"
                          }`}>
                            {item.status}
                          </div>
                        )}
                        {item?.score && (
                          <div className="text-xl font-black text-slate-800">
                            {item.score}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 space-y-4">
                      {item?.mistakes && item.mistakes.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                            Xato va Kamchiliklar
                          </h4>
                          <ul className="space-y-1.5 pl-5">
                            {item.mistakes.map((mistake: string, idx: number) => (
                              <li key={idx} className="text-sm text-slate-700 list-disc">{mistake}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {item?.feedback && (
                        <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100/50 text-sm">
                          <h4 className="text-xs font-bold text-blue-800 uppercase mb-1 flex items-center gap-1.5">
                            <Lightbulb className="w-3.5 h-3.5" /> Xulosa
                          </h4>
                          <p className="text-slate-700">{item.feedback}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isLoading && !result?.results && (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center absolute inset-0">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                <CheckSquare className="w-10 h-10 text-emerald-200" />
              </div>
              <h3 className="text-lg font-medium text-slate-600 mb-2">Barcha qog'ozlarni birdan tekshiring</h3>
              <p className="text-sm max-w-sm">Topshiriq shartini yozing, o'quvchilar javoblarini suratga olib bir vaqtda yuklang va AI natijani jadval qilib beradi.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
