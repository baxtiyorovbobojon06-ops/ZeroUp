"use client";

import { useState, useEffect } from "react";
import { FileSignature, Plus, Trash2, BookOpen, X, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
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

// AI-generated tests store { grade, difficulty, questions } as JSON in
// answerKey (no real classId yet), while manually-entered tests keep a plain
// answer-key string. Try to read the AI shape; fall back to null otherwise.
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

export default function TestsPage() {
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
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center shadow-sm">
            <FileSignature className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Testlar</h1>
            <p className="text-slate-500 dark:text-slate-400">Sinflar uchun testlar va javob kalitlari</p>
          </div>
        </div>

        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-amber-600 hover:bg-amber-700"
          leftIcon={<Plus className="w-5 h-5" />}
        >
          Yangi Test Yaratish
        </Button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-5">
              <Skeleton className="w-20 h-5 rounded-full mb-4" />
              <Skeleton className="w-3/4 h-5 mb-2" />
              <Skeleton className="w-1/2 h-4 mb-4" />
              <Skeleton className="w-full h-3" />
            </Card>
          ))}
        </div>
      ) : tests.length === 0 ? (
        <EmptyState icon={BookOpen} title="Hali hech qanday test yaratilmagan" description="Yangi test yaratish uchun yuqoridagi tugmani bosing" />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map(test => {
            const meta = test.class ? null : parseAnswerKeyMeta(test.answerKey);
            const gradeLabel = test.class?.name || (meta?.grade ? `${meta.grade}-sinf` : 'Sinf topilmadi');

            return (
              <Card key={test.id} className="flex flex-col h-full p-0 hover:border-amber-300 dark:hover:border-amber-500/40 hover:shadow-md transition-all group">
                <div className="p-5 flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold px-2.5 py-1 bg-amber-100 dark:bg-amber-500/15 text-amber-800 dark:text-amber-400 rounded-full">
                      {gradeLabel}
                    </span>
                    <button
                      onClick={() => handleDelete(test.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-1">{test.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{test.subject}</p>

                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
                    <div>📅 {new Date(test.date).toLocaleDateString()}</div>
                    <div>📝 {test.questionCount} ta savol</div>
                    <div>✅ {test._count?.attempts || 0} ta topshirilgan</div>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 rounded-b-3xl flex justify-between items-center">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate max-w-[200px]">
                    {meta
                      ? `AI test • Qiyinlik: ${meta.difficulty || "O'rta"}`
                      : `Kalit: ${test.answerKey.substring(0, 30)}...`}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">AI bilan test yaratish</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Mavzuni kiriting, AI savollarni tayyorlab beradi</p>
              </div>
              <button
                onClick={closeModal}
                disabled={generating}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors disabled:opacity-40"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerate} className="p-5 space-y-4 overflow-y-auto">
              <Input
                label="Fan"
                required
                value={genForm.fan}
                onChange={e => setGenForm({ ...genForm, fan: e.target.value })}
                placeholder="Masalan: Biologiya"
              />
              <Input
                label="Sinf"
                required
                value={genForm.sinf}
                onChange={e => setGenForm({ ...genForm, sinf: e.target.value })}
                placeholder="Masalan: 8"
              />
              <Input
                label="Mavzu"
                required
                value={genForm.mavzu}
                onChange={e => setGenForm({ ...genForm, mavzu: e.target.value })}
                placeholder="Masalan: Yurak"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Savollar soni"
                  type="number" min="1" max="20"
                  value={genForm.savollarSoni}
                  onChange={e => setGenForm({ ...genForm, savollarSoni: e.target.value })}
                />
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Qiyinlik</label>
                  <select
                    value={genForm.qiyinlik}
                    onChange={e => setGenForm({ ...genForm, qiyinlik: e.target.value })}
                    className="w-full px-5 py-3.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-2 border-white/60 dark:border-slate-700/60 rounded-2xl text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:border-primary transition-all duration-300 shadow-inner"
                  >
                    <option value="Oson">Oson</option>
                    <option value="O'rta">O&apos;rta</option>
                    <option value="Qiyin">Qiyin</option>
                  </select>
                </div>
              </div>

              {generateError && (
                <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>{generateError}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={closeModal} disabled={generating}>Bekor qilish</Button>
                <Button type="submit" isLoading={generating} leftIcon={<Sparkles className="w-4 h-4" />} className="bg-amber-600 hover:bg-amber-700">
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
