"use client";

import { useState, useEffect } from "react";
import { FileSignature, Plus, Trash2, BookOpen } from "lucide-react";
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
  class?: ClassItem;
  _count?: { attempts: number };
}

export default function TestsPage() {
  const [tests, setTests] = useState<TestItem[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [classId, setClassId] = useState("");
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [questionCount, setQuestionCount] = useState("20");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [answerKey, setAnswerKey] = useState("");

  const fetchClasses = () => {
    fetch("/api/classes")
      .then(res => res.json())
      .then(data => {
        setClasses(data);
        if (data.length > 0) setClassId(data[0].id);
      })
      .catch(() => {
        toast.error("Sinflarni yuklashda xatolik");
      });
  };

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
    fetchClasses();
    fetchTests();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId || !subject || !title || !answerKey) {
      return toast.error("Barcha maydonlarni to'ldiring");
    }
    
    try {
      const res = await fetch("/api/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId, subject, title, questionCount, date, answerKey
        })
      });
      
      if (res.ok) {
        toast.success("Test muvaffaqiyatli yaratildi");
        setShowForm(false);
        setSubject("");
        setTitle("");
        setAnswerKey("");
        fetchTests();
      } else {
        toast.error("Xatolik yuz berdi");
      }
    } catch {
      toast.error("Xatolik yuz berdi");
    }
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
          onClick={() => setShowForm(!showForm)}
          className="bg-amber-600 hover:bg-amber-700"
          leftIcon={<Plus className="w-5 h-5" />}
        >
          Yangi Test Yaratish
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 bg-amber-50/30 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Yangi test ma&apos;lumotlari</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Sinf</label>
                <select
                  value={classId}
                  onChange={e => setClassId(e.target.value)}
                  className="w-full px-4 py-3.5 bg-white/60 dark:bg-slate-800/60 border-2 border-white/60 dark:border-slate-700/60 rounded-2xl focus:outline-none focus:border-primary text-slate-800 dark:text-slate-100 shadow-inner font-medium transition-all duration-300"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <Input label="Fan" type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Masalan: Matematika" />
              <Input label="Test nomi" type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Algebra - 3-test" />
              <Input label="Sana" type="date" value={date} onChange={e => setDate(e.target.value)} />
              <Input label="Savollar soni" type="number" min="1" max="100" value={questionCount} onChange={e => setQuestionCount(e.target.value)} />
            </div>

            <div className="pt-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Javob kaliti</label>
              <textarea
                rows={5}
                value={answerKey}
                onChange={e => setAnswerKey(e.target.value)}
                placeholder="1-A, 2-B, 3-C, 4-D..."
                className="w-full px-5 py-3.5 bg-white/60 dark:bg-slate-800/60 border-2 border-white/60 dark:border-slate-700/60 rounded-2xl focus:outline-none focus:border-primary text-slate-800 dark:text-slate-100 shadow-inner resize-none font-mono text-sm transition-all duration-300"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Har bir savol raqami va uning javobini vergul bilan ajratib kiriting.</p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Bekor qilish</Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700">Testni saqlash</Button>
            </div>
          </form>
        </Card>
      )}

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
          {tests.map(test => (
            <Card key={test.id} className="flex flex-col h-full p-0 hover:border-amber-300 dark:hover:border-amber-500/40 hover:shadow-md transition-all group">
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold px-2.5 py-1 bg-amber-100 dark:bg-amber-500/15 text-amber-800 dark:text-amber-400 rounded-full">
                    {test.class?.name || 'Sinf topilmadi'}
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
                  Kalit: {test.answerKey.substring(0, 30)}...
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
