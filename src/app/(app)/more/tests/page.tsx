"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Plus, Trash2, BookOpen, X, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import toast from "react-hot-toast";

interface ClassItem {
  id: string;
  name: string;
}

interface TestItem {
  id: string;
  title: string;
  subject: string;
  date: string;
  questionCount: number;
  answerKey: string;
  class?: ClassItem | null;
  _count?: { attempts: number };
}

interface GenerateTestPayload {
  fan: string;
  sinf: string;
  mavzu: string;
  savollarSoni: string;
  qiyinlik: string;
}

interface AnswerKeyMeta {
  grade?: string;
  difficulty?: string;
}

function parseAnswerKeyMeta(answerKey: string): AnswerKeyMeta | null {
  try {
    const parsed = JSON.parse(answerKey);
    if (parsed && typeof parsed === "object" && Array.isArray(parsed.questions)) {
      return { grade: parsed.grade, difficulty: parsed.difficulty };
    }
  } catch {
    // not JSON — a plain manually-entered answer key
  }
  return null;
}

async function generateTest(payload: GenerateTestPayload): Promise<TestItem> {
  const res = await fetch('/api/tests/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || 'Test generatsiya qilishda xatolik yuz berdi');
  }
  return res.json();
}

const initialGenForm: GenerateTestPayload = {
  fan: "",
  sinf: "",
  mavzu: "",
  savollarSoni: "5",
  qiyinlik: "O'rta",
};

function TestsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tests, setTests] = useState<TestItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [genForm, setGenForm] = useState<GenerateTestPayload>(initialGenForm);

  const fetchTests = () => {
    fetch("/api/tests")
      .then(res => res.json())
      .then(data => {
        setTests(data);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Testlarni yuklashda xatolik");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTests();
  }, []);

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      Promise.resolve().then(() => setShowCreateModal(true));
    }
  }, [searchParams]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genForm.fan || !genForm.sinf || !genForm.mavzu) {
      setGenerateError("Fan, sinf va mavzuni to'ldiring");
      return;
    }

    setGenerating(true);
    setGenerateError("");
    try {
      const newTest = await generateTest(genForm);
      setTests(prev => [newTest, ...prev]);
      toast.success("Test muvaffaqiyatli yaratildi");
      setShowCreateModal(false);
      setGenForm(initialGenForm);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      setGenerateError(message || "Test yaratib bo'lmadi, qayta urinib ko'ring.");
    } finally {
      setGenerating(false);
    }
  };

  const closeModal = () => {
    if (generating) return;
    setShowCreateModal(false);
    setGenerateError("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Test va uning barcha natijalari o'chiriladi. Rozimisiz?")) return;
    try {
      const res = await fetch(`/api/tests/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Test o'chirildi");
        fetchTests();
      }
    } catch {
      toast.error("Xatolik yuz berdi");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1 text-[var(--text-secondary)]">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-medium text-[var(--text-primary)]">Testlar</h1>
          <p className="text-xs text-[var(--text-muted)]">Yaratilgan testlar va javob kalitlari</p>
        </div>
      </div>

      <Button className="w-full" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowCreateModal(true)}>
        Yangi test yaratish
      </Button>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-[var(--radius-card)]" />
          ))}
        </div>
      ) : tests.length === 0 ? (
        <EmptyState icon={BookOpen} title="Hali hech qanday test yaratilmagan" description="Yangi test yaratish uchun yuqoridagi tugmani bosing" />
      ) : (
        <div className="space-y-2">
          {tests.map(test => {
            const meta = test.class ? null : parseAnswerKeyMeta(test.answerKey);
            const gradeLabel = test.class?.name || (meta?.grade ? `${meta.grade}-sinf` : 'Sinf topilmadi');

            return (
              <Card key={test.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ background: "var(--accent-bg-tint)", color: "var(--accent-primary-hover)" }}
                  >
                    {gradeLabel}
                  </span>
                  <button onClick={() => handleDelete(test.id)} className="p-1 text-[var(--text-muted)] hover:text-[var(--danger-text)]">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="font-medium text-[var(--text-primary)]">{test.title}</h3>
                <p className="text-sm text-[var(--text-muted)] mb-2">{test.subject}</p>

                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--text-muted)]">
                  <span>{new Date(test.date).toLocaleDateString()}</span>
                  <span>{test.questionCount} ta savol</span>
                  <span>{test._count?.attempts || 0} ta topshirilgan</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40">
          <div className="bg-[var(--card-bg)] rounded-[var(--radius-card)] shadow-xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b-[0.5px] flex justify-between items-center" style={{ borderColor: "var(--card-border)" }}>
              <div>
                <h2 className="font-medium text-[var(--text-primary)]">AI bilan test yaratish</h2>
                <p className="text-xs text-[var(--text-muted)]">Mavzuni kiriting, AI savollarni tayyorlab beradi</p>
              </div>
              <button onClick={closeModal} disabled={generating} className="p-1 text-[var(--text-muted)] disabled:opacity-40">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerate} className="p-4 space-y-3 overflow-y-auto">
              <Input label="Fan" required value={genForm.fan} onChange={e => setGenForm({ ...genForm, fan: e.target.value })} placeholder="Masalan: Biologiya" />
              <Input label="Sinf" required value={genForm.sinf} onChange={e => setGenForm({ ...genForm, sinf: e.target.value })} placeholder="Masalan: 8" />
              <Input label="Mavzu" required value={genForm.mavzu} onChange={e => setGenForm({ ...genForm, mavzu: e.target.value })} placeholder="Masalan: Yurak" />

              <div className="grid grid-cols-2 gap-3">
                <Input label="Savollar soni" type="number" min="1" max="20" value={genForm.savollarSoni} onChange={e => setGenForm({ ...genForm, savollarSoni: e.target.value })} />
                <Select label="Qiyinlik" value={genForm.qiyinlik} onChange={e => setGenForm({ ...genForm, qiyinlik: e.target.value })}>
                  <option value="Oson">Oson</option>
                  <option value="O'rta">O&apos;rta</option>
                  <option value="Qiyin">Qiyin</option>
                </Select>
              </div>

              {generateError && (
                <div className="p-3 rounded-[var(--radius)] text-sm flex items-start gap-2" style={{ background: "var(--danger-bg)", color: "var(--danger-text)" }}>
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>{generateError}</p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="secondary" onClick={closeModal} disabled={generating}>Bekor qilish</Button>
                <Button type="submit" isLoading={generating} leftIcon={<Sparkles className="w-4 h-4" />}>
                  {generating ? "Yaratilmoqda..." : "Test yaratish"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TestsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-[var(--text-muted)]">Yuklanmoqda...</div>}>
      <TestsContent />
    </Suspense>
  );
}
