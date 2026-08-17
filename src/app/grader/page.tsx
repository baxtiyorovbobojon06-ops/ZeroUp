"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Upload, X, AlertCircle, Save, Play, LayoutDashboard } from "lucide-react";
import toast from "react-hot-toast";

import { experimental_useObject as useObject } from '@ai-sdk/react';
import { z } from 'zod';

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";

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
  const router = useRouter();
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

  const handleSubmit = async () => {
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
  const canSubmit = !isLoading && files.length > 0 && !!selectedTestId;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1 text-[var(--text-secondary)]">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-medium text-[var(--text-primary)]">AI Tekshiruvchi</h1>
          <p className="text-xs text-[var(--text-muted)]">Javob varaqalarini AI orqali tekshiring</p>
        </div>
      </div>

      <Card className="space-y-4">
        <Select label="Sinf" value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)}>
          {classes.length === 0 && <option value="">Sinflar yo&apos;q</option>}
          {classes.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>

        <Select
          label="Test"
          value={selectedTestId}
          onChange={e => setSelectedTestId(e.target.value)}
          disabled={!selectedClassId || tests.length === 0}
        >
          {tests.length === 0 && <option value="">Testlar yo&apos;q</option>}
          {tests.map(t => (
            <option key={t.id} value={t.id}>{t.title} ({t.questionCount} ta savol)</option>
          ))}
        </Select>

        <div>
          <label className="text-xs font-medium text-[var(--text-secondary)]">Javob varaqalari (Rasmlar)</label>
          <div
            className="mt-1.5 border-2 border-dashed rounded-[var(--radius-card)] p-6 text-center cursor-pointer"
            style={{ borderColor: "var(--input-border)" }}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <Upload className="w-7 h-7 mx-auto mb-2" style={{ color: "var(--accent-primary)" }} />
            <p className="text-sm font-medium text-[var(--text-primary)]">Rasmlarni yuklash</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Ko&apos;pi bilan 30 ta rasm (JPG, PNG)</p>
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
            <div className="flex justify-between text-xs text-[var(--text-muted)]">
              <span>Yuklangan fayllar</span>
              <span>{files.length}/30</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {files.map((file, idx) => (
                <div key={idx} className="relative rounded-lg overflow-hidden border-[0.5px] aspect-square" style={{ borderColor: "var(--card-border)" }}>
                  <Image src={URL.createObjectURL(file)} alt="preview" fill unoptimized className="object-cover" />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                    className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-[var(--radius)] text-sm flex items-start gap-2" style={{ background: "var(--danger-bg)", color: "var(--danger-text)" }}>
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>AI tarmog&apos;ida xatolik yuz berdi. Iltimos qaytadan urinib ko&apos;ring.</p>
          </div>
        )}
      </Card>

      <div className="flex flex-col items-center gap-3 py-2">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-[132px] h-[132px] rounded-full flex flex-col items-center justify-center gap-1.5 text-white transition-transform active:scale-95 disabled:opacity-50"
          style={{ background: "var(--accent-primary)", border: "6px solid var(--accent-bg-tint)" }}
        >
          <Play className="w-7 h-7" fill="currentColor" />
          <span className="text-sm font-medium">{isLoading ? "Tekshirilmoqda..." : "Tekshirish"}</span>
        </button>
        <p className="text-xs text-[var(--text-muted)] text-center max-w-[260px]">
          Sinf, test va rasmlarni tanlagach, tekshirishni boshlash uchun tugmani bosing
        </p>
      </div>

      <div className="space-y-3">
        {!hasResults && !isLoading ? (
          <EmptyState
            icon={LayoutDashboard}
            title="Natijalar jadvali"
            description="Rasmlarni yuklang va AI orqali tekshirishni boshlang. Natijalar shu yerda paydo bo'ladi."
          />
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-medium text-[var(--text-primary)]">Tahlil natijalari</h2>
                <p className="text-xs text-[var(--text-muted)]">{result?.results?.length || 0} ta o&apos;quvchi tekshirildi</p>
              </div>
              {hasResults && !isLoading && (
                <Button onClick={saveResults} isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />}>Saqlash</Button>
              )}
            </div>

            {result?.results?.map((res, idx) => (
              <Card key={idx} className="p-0 overflow-hidden">
                <div className="p-4 border-b-[0.5px]" style={{ borderColor: "var(--card-border)" }}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-[var(--text-primary)]">{res?.student_name || 'Noaniq'}</h3>
                    <div className="text-xl font-medium" style={{ color: "var(--accent-primary)" }}>{res?.percentage || 0}%</div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mt-1">
                    <span>Variant: {res?.variant || '-'}</span>
                    <span>To&apos;g&apos;ri: {res?.score || 0} ta</span>
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-xs text-[var(--text-muted)] mb-3">Savollar bo&apos;yicha tahlil</p>
                  <div className="grid grid-cols-5 gap-2">
                    {res?.answers?.map((ans, aIdx) => {
                      const isCorrect = ans?.isCorrect;
                      const isUnanswered = ans?.studentAnswer === "-";
                      const lowConfidence = (ans?.confidence || 1) < 0.8;

                      let style: React.CSSProperties = { background: "var(--input-bg)", borderColor: "var(--card-border)", color: "var(--text-secondary)" };
                      if (isCorrect) style = { background: "var(--success-bg)", borderColor: "var(--success-bg)", color: "var(--success-text)" };
                      else if (!isUnanswered) style = { background: "var(--danger-bg)", borderColor: "var(--danger-bg)", color: "var(--danger-text)" };

                      return (
                        <div key={aIdx} className="relative flex flex-col items-center justify-center p-2 rounded-lg border" style={style}>
                          <span className="text-[10px] opacity-70 mb-0.5">{ans?.question || aIdx + 1}</span>
                          <span className="font-medium text-sm">{ans?.studentAnswer || '-'}</span>
                          {lowConfidence && (
                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full" style={{ background: "var(--warning-text)" }} title="AI ishonchi past" />
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {res?.answers?.some(a => (a?.confidence || 1) < 0.8) && (
                    <div className="mt-4 p-3 rounded-[var(--radius)] flex items-start gap-2 text-xs" style={{ background: "var(--warning-bg)", color: "var(--warning-text)" }}>
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <p>Sariq nuqta bilan belgilangan savollarni qayta ko&apos;zdan kechiring. AI ularni o&apos;qishda qiynalgan bo&apos;lishi mumkin.</p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
