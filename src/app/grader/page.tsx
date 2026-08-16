"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { CheckSquare, Upload, X, AlertCircle, Save, LayoutDashboard } from "lucide-react";
import toast from "react-hot-toast";

import { experimental_useObject as useObject } from '@ai-sdk/react';
import { z } from 'zod';

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const schema = z.object({
  results: z.array(
    z.object({
      student_name: z.string(),
      variant: z.string().optional(),
      score: z.number(),
      percentage: z.number(),
      answers: z.array(
        z.object({
          question: z.number(),
          studentAnswer: z.string(),
          correctAnswer: z.string(),
          isCorrect: z.boolean(),
          confidence: z.number()
        })
      )
    })
  )
});

interface ClassItem {
  id: string;
  name: string;
}

interface TestItem {
  id: string;
  title: string;
  questionCount: number;
  answerKey: string;
}

export default function Grader() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [tests, setTests] = useState<TestItem[]>([]);
  
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedTestId, setSelectedTestId] = useState("");
  
  const [files, setFiles] = useState<File[]>([]);
  
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch("/api/classes").then(r => r.json()).then(data => {
      setClasses(data);
      if (data.length > 0) setSelectedClassId(data[0].id);
    });
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      fetch(`/api/tests?classId=${selectedClassId}`).then(r => r.json()).then(data => {
        setTests(data);
        if (data.length > 0) setSelectedTestId(data[0].id);
        else setSelectedTestId("");
      });
    }
  }, [selectedClassId]);

  const { object: streamedResult, submit, isLoading, error } = useObject({
    api: '/api/grader',
    schema: schema,
    onFinish: () => {
      toast.success("Barcha rasmlar tahlil qilindi!");
    },
    onError: () => {
      toast.error("Tekshirishda xatolik yuz berdi. Yoki rasmlar hajmi juda katta.");
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
    if (!selectedClassId || !selectedTestId) {
      return toast.error("Sinf va testni tanlang");
    }
    if (files.length === 0) {
      return toast.error("Kamida bitta rasm yuklang!");
    }

    const test = tests.find(t => t.id === selectedTestId);
    if (!test) return toast.error("Test topilmadi");

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
        testId: selectedTestId,
        answerKey: test.answerKey,
        questionCount: test.questionCount,
        images: imagesData
      });
    } catch {
      toast.dismiss("graderLoad");
      toast.error("Rasmlarni o'qishda xatolik");
    }
  };

  const saveResults = async () => {
    if (!result?.results || result.results.length === 0) return;
    setIsSaving(true);
    
    try {
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testId: selectedTestId,
          classId: selectedClassId,
          results: result.results
        })
      });
      
      if (res.ok) {
        toast.success("Natijalar bazaga muvaffaqiyatli saqlandi!");
      } else {
        toast.error("Saqlashda xatolik yuz berdi");
      }
    } catch {
      toast.error("Saqlashda xatolik yuz berdi");
    } finally {
      setIsSaving(false);
    }
  };

  const result = streamedResult;
  const hasResults = result?.results && result.results.length > 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
          <CheckSquare className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI Tekshiruvchi</h1>
          <p className="text-slate-500">Testlarni Ommaviy Tekshirish va Heatmap tahlili</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[350px_1fr] gap-6 items-start">
        {/* Left Panel: Configuration */}
        <Card className="sticky top-20">
          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Sinfni tanlang</label>
              <select 
                value={selectedClassId} 
                onChange={e => setSelectedClassId(e.target.value)}
                className="w-full px-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
              >
                {classes.length === 0 && <option value="">Sinflar yo&apos;q</option>}
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Testni tanlang</label>
              <select 
                value={selectedTestId} 
                onChange={e => setSelectedTestId(e.target.value)}
                className="w-full px-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                disabled={!selectedClassId || tests.length === 0}
              >
                {tests.length === 0 && <option value="">Testlar yo&apos;q</option>}
                {tests.map(t => (
                  <option key={t.id} value={t.id}>{t.title} ({t.questionCount} ta savol)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Javob varaqalari (Rasmlar)</label>
              <div 
                className="border-2 border-dashed border-emerald-200 rounded-xl p-6 text-center hover:bg-emerald-50/50 transition-colors cursor-pointer relative"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Upload className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-600">Rasmlarni yuklash</p>
                <p className="text-xs text-slate-400 mt-1">Ko&apos;pi bilan 30 ta rasm (JPG, PNG)</p>
                <input 
                  id="file-upload"
                  type="file" 
                  multiple 
                  accept="image/*"
                  className="hidden" 
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-500">
                  <span>Yuklangan fayllar</span>
                  <span>{files.length}/30</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {files.map((file, idx) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden border aspect-square bg-slate-50">
                      <Image
                        src={URL.createObjectURL(file)}
                        alt="preview"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-base py-6"
              disabled={isLoading || files.length === 0 || !selectedTestId}
              isLoading={isLoading}
            >
              AIni ishga tushirish
            </Button>
            
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p>AI tarmog&apos;ida xatolik yuz berdi. Iltimos qaytadan urinib ko&apos;ring.</p>
              </div>
            )}
          </form>
        </Card>

        {/* Right Panel: Heatmap Results */}
        <div className="space-y-4">
          {!hasResults && !isLoading ? (
            <div className="h-[500px] flex items-center justify-center bg-slate-50 border border-dashed rounded-2xl">
              <div className="text-center p-6">
                <LayoutDashboard className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-700">Natijalar jadvali</h3>
                <p className="text-slate-500 max-w-sm mx-auto mt-2 text-sm">
                  Rasmlarni yuklang va AI orqali tekshirishni boshlang. Natijalar savolma-savol tahlil qilinib, shu yerda paydo bo&apos;ladi.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border">
                <div>
                  <h2 className="font-bold text-lg text-slate-800">Tahlil natijalari</h2>
                  <p className="text-sm text-slate-500">
                    {result?.results?.length || 0} ta o&apos;quvchi tekshirildi
                  </p>
                </div>
                {hasResults && !isLoading && (
                  <Button onClick={saveResults} isLoading={isSaving} className="bg-emerald-600" leftIcon={<Save className="w-4 h-4"/>}>
                    Bazaga saqlash
                  </Button>
                )}
              </div>

              {result?.results?.map((res, idx) => (
                <Card key={idx} className="overflow-hidden border-slate-200">
                  <div className="bg-slate-50 p-4 border-b flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-lg text-slate-800">{res?.student_name || 'Noaniq'}</h3>
                      <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 mt-1">
                        <span className="bg-white px-2 py-1 rounded border">Variant: {res?.variant || '-'}</span>
                        <span className="bg-white px-2 py-1 rounded border">To&apos;g&apos;ri: {res?.score || 0} ta</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black text-emerald-600">{res?.percentage || 0}%</div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">Savollar bo&apos;yicha tahlil (Heatmap)</p>
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                      {res?.answers?.map((ans, aIdx) => {
                        const isCorrect = ans?.isCorrect;
                        const isUnanswered = ans?.studentAnswer === "-";
                        const lowConfidence = (ans?.confidence || 1) < 0.8;
                        
                        let bgColor = "bg-slate-100 border-slate-200";
                        if (isCorrect) bgColor = "bg-emerald-100 border-emerald-200 text-emerald-800";
                        else if (!isUnanswered) bgColor = "bg-red-100 border-red-200 text-red-800";
                        else bgColor = "bg-slate-200 border-slate-300 text-slate-600";
                        
                        return (
                          <div key={aIdx} className={`relative flex flex-col items-center justify-center p-2 rounded-lg border ${bgColor} ${lowConfidence ? 'ring-2 ring-amber-400 border-transparent' : ''}`}>
                            <span className="text-[10px] opacity-70 mb-0.5">{ans?.question || aIdx+1}</span>
                            <span className="font-bold">{ans?.studentAnswer || '-'}</span>
                            {lowConfidence && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-pulse" title="AI ishonchi past (Ustoz tekshiruvi tavsiya etiladi)" />
                            )}
                          </div>
                        )
                      })}
                    </div>
                    
                    {res?.answers?.some(a => (a?.confidence || 1) < 0.8) && (
                      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3 text-sm">
                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                        <div>
                          <p className="font-semibold text-amber-800">Noaniq javoblar mavjud</p>
                          <p className="text-amber-700 mt-0.5">Sariq nuqta bilan belgilangan savollarni qayta ko&apos;zdan kechirishingiz tavsiya etiladi. AI ularni o&apos;qishda qiynalgan bo&apos;lishi mumkin.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
