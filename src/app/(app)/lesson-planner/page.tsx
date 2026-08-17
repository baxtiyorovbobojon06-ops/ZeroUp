"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Sparkles, Download, Clock, Target, PenTool, CheckCircle, Upload, X, Plus, Pencil, Trash2, BookOpen, AlertCircle } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import toast from "react-hot-toast";

import { experimental_useObject as useObject } from '@ai-sdk/react';
import { z } from 'zod';

import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useLessonPlans, LessonPlanContent, LessonPlanRecord } from "@/hooks/useLessonPlans";

const schema = z.object({
  title: z.string().describe("Mavzu nomi"),
  image_prompt: z.string().optional().describe("A detailed descriptive prompt in ENGLISH for generating an image related to this specific topic."),
  objectives: z.array(z.string()).describe("Dars maqsadlari ro'yxati"),
  resources: z.array(z.string()).describe("Kerakli jihozlar va resurslar"),
  phases: z.array(z.object({
    phase_name: z.string(),
    duration: z.number(),
    teacher_action: z.string(),
    student_action: z.string()
  })).describe("Dars bosqichlari"),
  assessment: z.string().describe("Baholash usuli"),
  homework: z.string().describe("Uyga vazifa"),
  quiz: z.array(z.object({
    question: z.string(),
    options: z.array(z.string()),
    correct_answer: z.string()
  })).describe("Kamida 10 ta test savoli")
});

interface ClassItem {
  id: string;
  name: string;
}

type ViewState = 'list' | 'form' | 'detail';

type AiInsightState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; text: string };

export default function LessonPlanner() {
  const router = useRouter();
  const { plans, addPlan, updatePlan, removePlan } = useLessonPlans();

  const [view, setView] = useState<ViewState>('list');
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  useEffect(() => {
    document.getElementById('app-main')?.scrollTo(0, 0);
  }, [view]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [detailPlan, setDetailPlan] = useState<LessonPlanRecord | null>(null);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  const reportRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    classId: "",
    subject: "",
    topic: "",
    duration: "45",
    additionalInfo: "",
  });
  const [file, setFile] = useState<File | null>(null);

  const [showAiInsightModal, setShowAiInsightModal] = useState(false);
  const [aiInsight, setAiInsight] = useState<AiInsightState>({ status: 'idle' });

  useEffect(() => {
    fetch("/api/classes").then(r => r.json()).then(data => {
      setClasses(data);
      if (data.length > 0) setFormData(f => ({ ...f, classId: f.classId || data[0].id }));
    });
  }, []);

  const { submit, isLoading } = useObject({
    api: '/api/lesson-planner',
    schema: schema,
    onFinish: ({ object }) => {
      if (object) {
        const cls = classes.find(c => c.id === formData.classId);
        const content = object as LessonPlanContent;
        if (editingId) {
          updatePlan(editingId, { classId: formData.classId, className: cls?.name || "", subject: formData.subject, content });
        } else {
          addPlan({ classId: formData.classId, className: cls?.name || "", subject: formData.subject, content });
        }
        toast.success("Dars rejasi tayyor!");
        setView('list');
        setEditingId(null);
        setFile(null);
      }
    },
    onError: () => {
      toast.error("Xatolik yuz berdi. Qayta urinib ko'ring.");
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.classId) return toast.error("Sinfni tanlang");

    let base64File = null;
    let mimeType = null;
    let fileName = null;

    if (file) {
      toast.loading("Fayl o'qilmoqda...", { id: "fileLoad" });
      base64File = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
      });
      mimeType = file.type;
      fileName = file.name;
      toast.dismiss("fileLoad");
    }

    const cls = classes.find(c => c.id === formData.classId);
    submit({
      grade: cls?.name || "",
      subject: formData.subject,
      topic: formData.topic,
      duration: formData.duration,
      additionalInfo: formData.additionalInfo || undefined,
      fileData: base64File ? { data: base64File, mimeType, name: fileName } : null
    });
  };

  const handleGetAiInsight = () => {
    if (!formData.classId) return toast.error("Avval sinfni tanlang");
    setShowAiInsightModal(true);
    setAiInsight({ status: 'loading' });
    fetch(`/api/classes/${formData.classId}/lesson-insights`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Xatolik");
        return data;
      })
      .then((data: { malumot: string }) => setAiInsight({ status: 'ready', text: data.malumot }))
      .catch(() => setAiInsight({ status: 'error' }));
  };

  const acceptAiInsight = () => {
    if (aiInsight.status === 'ready') {
      setFormData(f => ({ ...f, additionalInfo: aiInsight.text }));
    }
    setShowAiInsightModal(false);
  };

  const rejectAiInsight = () => {
    setShowAiInsightModal(false);
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

      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("Fayl hajmi 5MB dan oshmasligi kerak!");
        e.target.value = '';
        return;
      }

      setFile(selectedFile);
    } else {
      setFile(null);
    }
  };

  const openCreateForm = () => {
    setEditingId(null);
    setFormData({ classId: activeFilter !== 'all' ? activeFilter : (classes[0]?.id || ""), subject: "", topic: "", duration: "45", additionalInfo: "" });
    setFile(null);
    setView('form');
  };

  const openEditForm = (plan: LessonPlanRecord) => {
    setEditingId(plan.id);
    setFormData({ classId: plan.classId, subject: plan.subject, topic: plan.content.title, duration: "45", additionalInfo: "" });
    setFile(null);
    setView('form');
  };

  const openDetail = (plan: LessonPlanRecord) => {
    setDetailPlan(plan);
    setView('detail');
  };

  const handleDelete = (id: string) => {
    if (!confirm("Dars rejasini o'chirasizmi?")) return;
    removePlan(id);
    toast.success("Dars rejasi o'chirildi");
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
      pdf.save(`dars-rejasi-${detailPlan?.content.title || "AI"}.pdf`);
      toast.success("PDF saqlandi!", { id: toastId });
    } catch {
      toast.error("PDF saqlashda xatolik yuz berdi.", { id: toastId });
    }
  };

  const filteredPlans = activeFilter === 'all' ? plans : plans.filter(p => p.classId === activeFilter);

  const headerBack = () => {
    if (view === 'list') router.back();
    else { setView('list'); setDetailPlan(null); setEditingId(null); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={headerBack} className="p-1 text-[var(--text-secondary)]">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-medium text-[var(--text-primary)]">Dars rejasi</h1>
          {view === 'list' && <p className="text-xs text-[var(--text-muted)]">Darslar rejasini tuzing va boshqaring</p>}
        </div>
      </div>

      {view === 'list' && (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 custom-scrollbar">
            <button
              onClick={() => setActiveFilter('all')}
              className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors"
              style={activeFilter === 'all'
                ? { background: "var(--accent-primary)", color: "#fff" }
                : { background: "var(--input-bg)", border: "1px solid var(--card-border)", color: "var(--text-secondary)" }}
            >
              Barchasi
            </button>
            {classes.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveFilter(c.id)}
                className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors"
                style={activeFilter === c.id
                  ? { background: "var(--accent-primary)", color: "#fff" }
                  : { background: "var(--input-bg)", border: "1px solid var(--card-border)", color: "var(--text-secondary)" }}
              >
                {c.name}
              </button>
            ))}
          </div>

          <Button className="w-full" leftIcon={<Plus className="w-4 h-4" />} onClick={openCreateForm}>
            Yangi dars rejasi qo&apos;shish
          </Button>

          {filteredPlans.length === 0 ? (
            <EmptyState icon={BookOpen} title="Hali dars rejasi yo'q" description="Yuqoridagi tugma orqali birinchi dars rejangizni yarating." action={<Button onClick={openCreateForm}>Yangi dars rejasi</Button>} />
          ) : (
            <div className="space-y-2">
              {filteredPlans.map(plan => (
                <Card key={plan.id} className="p-3.5 cursor-pointer" onClick={() => openDetail(plan)}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: "var(--accent-bg-tint)", color: "var(--accent-primary-hover)" }}>
                      {plan.className} {plan.subject ? `• ${plan.subject}` : ""}
                    </span>
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => { e.stopPropagation(); openEditForm(plan); }} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--accent-primary)]">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(plan.id); }} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--danger-text)]">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-[var(--text-primary)]">{plan.content.title}</h3>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{new Date(plan.date).toLocaleDateString()}</p>
                  {plan.content.objectives?.[0] && (
                    <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed line-clamp-2">{plan.content.objectives[0]}</p>
                  )}
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {view === 'form' && (
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select label="Sinf" required value={formData.classId} onChange={(e) => setFormData({ ...formData, classId: e.target.value })}>
              {classes.length === 0 && <option value="">Sinflar yo&apos;q</option>}
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <Input
              label="Fan"
              type="text" required
              placeholder="Masalan: Matematika"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            />
            <Input
              label="Mavzu"
              type="text" required
              placeholder="Masalan: Kvadrat tenglama"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            />
            <Input
              label="Dars davomiyligi (daqiqa)"
              type="number" required
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-[var(--text-secondary)]">Qo&apos;shimcha ma&apos;lumotlar (ixtiyoriy)</label>
                <button
                  type="button"
                  onClick={handleGetAiInsight}
                  disabled={!formData.classId}
                  className="text-xs font-medium flex items-center gap-1 disabled:opacity-40"
                  style={{ color: "var(--accent-primary)" }}
                >
                  <Sparkles className="w-3.5 h-3.5" /> AI orqali ma&apos;lumot olish
                </button>
              </div>
              <textarea
                value={formData.additionalInfo}
                onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                placeholder="Sinf haqida qo'shimcha ma'lumot, masalan o'quvchilarning bilim darajasi yoki e'tibor talab qiladigan mavzular"
                rows={3}
                className="w-full border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] rounded-[var(--radius)] px-2.5 py-2.5 text-[13px] outline-none transition-colors focus:border-[var(--accent-primary)] focus:shadow-[0_0_0_2px_var(--accent-bg-tint)] placeholder:text-[var(--text-muted)] resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)]">Qo&apos;shimcha material (ixtiyoriy)</label>
              <div
                className="mt-1.5 border-2 border-dashed rounded-[var(--radius-card)] p-5 text-center cursor-pointer"
                style={{ borderColor: "var(--input-border)" }}
                onClick={() => document.getElementById('lp-file-upload')?.click()}
              >
                <Upload className="w-6 h-6 mx-auto mb-2" style={{ color: "var(--accent-primary)" }} />
                <p className="text-sm text-[var(--text-primary)]">{file ? file.name : "Fayl yuklang"}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">PDF, Word yoki Rasm (Max: 5MB)</p>
                <input id="lp-file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx,image/*" />
              </div>
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading} leftIcon={<Sparkles className="w-4 h-4" />}>
              {isLoading ? "Yaratilmoqda..." : editingId ? "Qayta yaratish" : "Dars yaratish"}
            </Button>
          </form>
        </Card>
      )}

      {view === 'detail' && detailPlan && (
        <>
          <div className="flex justify-end">
            <button onClick={downloadPDF} className="p-2 text-[var(--text-muted)] hover:text-[var(--accent-primary)]" title="PDF yuklab olish">
              <Download className="w-5 h-5" />
            </button>
          </div>
          <div ref={reportRef} className="space-y-5 bg-[var(--card-bg)] p-1">
            <div className="text-center mb-2 hidden show-in-pdf">
              <h1 className="text-xl font-bold">DARS REJASI</h1>
              <p className="mt-1">{detailPlan.subject} | {detailPlan.className}</p>
            </div>

            {detailPlan.content.image_prompt && (
              <div className="w-full h-56 rounded-[var(--radius-card)] overflow-hidden relative">
                <Image
                  src={`https://image.pollinations.ai/prompt/${encodeURIComponent(detailPlan.content.image_prompt)}?width=800&height=400&nologo=true`}
                  alt={detailPlan.content.title}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
            )}

            <h2 className="text-lg font-medium text-[var(--text-primary)]">{detailPlan.content.title}</h2>

            {detailPlan.content.objectives?.length > 0 && (
              <div className="p-4 rounded-[var(--radius-card)]" style={{ background: "var(--accent-bg-tint)" }}>
                <h3 className="text-xs font-medium mb-3 flex items-center gap-2" style={{ color: "var(--accent-primary-hover)" }}>
                  <Target className="w-4 h-4" /> Dars maqsadlari
                </h3>
                <ul className="space-y-2">
                  {detailPlan.content.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                      <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: "var(--accent-primary)" }} />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {detailPlan.content.resources?.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-[var(--text-primary)] mb-2">Kerakli jihozlar</h3>
                <div className="flex flex-wrap gap-2">
                  {detailPlan.content.resources.map((res, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-full text-xs" style={{ background: "var(--input-bg)", border: "1px solid var(--card-border)", color: "var(--text-secondary)" }}>
                      {res}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {detailPlan.content.phases?.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-medium text-[var(--text-primary)]">Dars bosqichlari</h3>
                {detailPlan.content.phases.map((phase, i) => (
                  <Card key={i} className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-sm text-[var(--text-primary)] flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]" style={{ background: "var(--accent-bg-tint)", color: "var(--accent-primary-hover)" }}>{i + 1}</span>
                        {phase.phase_name}
                      </h4>
                      <span className="px-2 py-0.5 rounded text-xs flex items-center gap-1 text-[var(--text-muted)]" style={{ background: "var(--input-bg)" }}>
                        <Clock className="w-3 h-3" /> {phase.duration} daq
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="p-2.5 rounded-lg" style={{ background: "var(--input-bg)" }}>
                        <h5 className="text-[10px] font-medium text-[var(--text-muted)] mb-1">O&apos;QITUVCHI</h5>
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{phase.teacher_action}</p>
                      </div>
                      <div className="p-2.5 rounded-lg" style={{ background: "var(--input-bg)" }}>
                        <h5 className="text-[10px] font-medium text-[var(--text-muted)] mb-1">O&apos;QUVCHI</h5>
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{phase.student_action}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {detailPlan.content.assessment && (
              <div className="p-4 rounded-[var(--radius-card)]" style={{ background: "var(--success-bg)" }}>
                <h3 className="text-xs font-medium mb-1" style={{ color: "var(--success-text)" }}>Baholash mezoni</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--success-text)" }}>{detailPlan.content.assessment}</p>
              </div>
            )}

            {detailPlan.content.homework && (
              <div className="p-4 rounded-[var(--radius-card)] flex gap-2" style={{ background: "var(--warning-bg)" }}>
                <PenTool className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--warning-text)" }} />
                <div>
                  <h3 className="text-xs font-medium mb-1" style={{ color: "var(--warning-text)" }}>Uyga vazifa</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--warning-text)" }}>{detailPlan.content.homework}</p>
                </div>
              </div>
            )}

            {detailPlan.content.quiz && detailPlan.content.quiz.length > 0 && (
              <div className="p-4 rounded-[var(--radius-card)] flex items-center justify-between gap-3" style={{ background: "var(--accent-bg-tint)" }}>
                <div>
                  <h3 className="text-xs font-medium mb-1" style={{ color: "var(--accent-primary-hover)" }}>Dars yakuni testi</h3>
                  <p className="text-xs text-[var(--text-secondary)]">Jami {detailPlan.content.quiz.length} ta test savoli</p>
                </div>
                <Button onClick={() => setIsTestModalOpen(true)} className="shrink-0 text-xs px-3 py-2">Ko&apos;rish</Button>
              </div>
            )}
          </div>
        </>
      )}

      {isTestModalOpen && detailPlan?.content.quiz && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40">
          <div className="bg-[var(--card-bg)] rounded-[var(--radius-card)] shadow-xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b-[0.5px] flex justify-between items-center" style={{ borderColor: "var(--card-border)" }}>
              <h2 className="font-medium text-[var(--text-primary)]">Test ({detailPlan.content.quiz.length} ta savol)</h2>
              <button onClick={() => setIsTestModalOpen(false)} className="p-1 text-[var(--text-muted)]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-4">
              {detailPlan.content.quiz.map((q, i) => (
                <div key={i} className="p-3.5 rounded-[var(--radius-card)] border-[0.5px]" style={{ borderColor: "var(--card-border)" }}>
                  <p className="text-sm font-medium text-[var(--text-primary)] mb-2">{i + 1}. {q.question}</p>
                  <div className="space-y-1">
                    {q.options.map((opt, idx) => (
                      <div key={idx} className="flex gap-2 text-xs text-[var(--text-secondary)]">
                        <span className="font-medium text-[var(--text-muted)] w-4">{String.fromCharCode(65 + idx)})</span>
                        <span>{opt}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t-[0.5px] text-xs font-medium flex items-center gap-1.5" style={{ borderColor: "var(--card-border)", color: "var(--success-text)" }}>
                    <CheckCircle className="w-3.5 h-3.5" /> To&apos;g&apos;ri javob: {q.correct_answer}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showAiInsightModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40">
          <div className="bg-[var(--card-bg)] rounded-[var(--radius-card)] shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-4 border-b-[0.5px] flex justify-between items-center" style={{ borderColor: "var(--card-border)" }}>
              <h2 className="font-medium text-[var(--text-primary)] flex items-center gap-2">
                <Sparkles className="w-4 h-4" style={{ color: "var(--accent-primary)" }} /> AI ma&apos;lumoti
              </h2>
              <button onClick={rejectAiInsight} className="p-1 text-[var(--text-muted)]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {aiInsight.status === 'loading' && (
                <p className="text-sm text-[var(--text-muted)] animate-pulse">AI ma&apos;lumot tayyorlamoqda...</p>
              )}

              {aiInsight.status === 'error' && (
                <div className="p-3 rounded-[var(--radius)] text-sm flex items-start gap-2" style={{ background: "var(--danger-bg)", color: "var(--danger-text)" }}>
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>Ma&apos;lumot olishda xatolik yuz berdi.</p>
                </div>
              )}

              {aiInsight.status === 'ready' && (
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{aiInsight.text}</p>
              )}

              {aiInsight.status === 'ready' && (
                <div>
                  <p className="text-xs text-[var(--text-muted)] mb-2">Shu ma&apos;lumot qo&apos;shimcha ma&apos;lumotlar qismiga qo&apos;shilsinmi?</p>
                  <div className="flex gap-2 justify-end">
                    <Button variant="secondary" onClick={rejectAiInsight}>YO&apos;Q</Button>
                    <Button onClick={acceptAiInsight}>HA</Button>
                  </div>
                </div>
              )}

              {aiInsight.status === 'error' && (
                <div className="flex gap-2 justify-end">
                  <Button variant="secondary" onClick={rejectAiInsight}>Yopish</Button>
                  <Button onClick={handleGetAiInsight}>Qayta urinish</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `.show-in-pdf { display: none; }` }} />
    </div>
  );
}
