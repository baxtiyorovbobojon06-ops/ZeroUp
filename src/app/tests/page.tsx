"use client";

import { useState, useEffect } from "react";
import { FileSignature, Plus, Trash2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
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
    } catch (err) {
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
    } catch (err) {
      toast.error("Xatolik yuz berdi");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shadow-sm">
            <FileSignature className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Testlar</h1>
            <p className="text-slate-500">Sinflar uchun testlar va javob kalitlari</p>
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
        <Card className="p-6 bg-amber-50/30 border-amber-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Yangi test ma&apos;lumotlari</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sinf</label>
                <select 
                  value={classId} 
                  onChange={e => setClassId(e.target.value)}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fan</label>
                <input 
                  type="text" value={subject} onChange={e => setSubject(e.target.value)}
                  placeholder="Masalan: Matematika"
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Test nomi</label>
                <input 
                  type="text" value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="Algebra - 3-test"
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sana</label>
                <input 
                  type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Savollar soni</label>
                <input 
                  type="number" min="1" max="100" value={questionCount} onChange={e => setQuestionCount(e.target.value)}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Javob kaliti</label>
              <textarea 
                rows={5}
                value={answerKey}
                onChange={e => setAnswerKey(e.target.value)}
                placeholder="1-A, 2-B, 3-C, 4-D..."
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none resize-none font-mono text-sm"
              />
              <p className="text-xs text-slate-500 mt-1">Har bir savol raqami va uning javobini vergul bilan ajratib kiriting.</p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Bekor qilish</Button>
              <Button type="submit" className="bg-amber-600">Testni saqlash</Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="text-center p-12 text-slate-400">Yuklanmoqda...</div>
      ) : tests.length === 0 ? (
        <div className="text-center p-16 bg-slate-50 border border-dashed rounded-2xl">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-medium text-slate-600">Hali hech qanday test yaratilmagan</h3>
          <p className="text-sm text-slate-500 mt-1">Yangi test yaratish uchun yuqoridagi tugmani bosing</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map(test => (
            <Card key={test.id} className="flex flex-col h-full border hover:border-amber-300 hover:shadow-md transition-all group">
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full">
                    {test.class?.name || 'Sinf topilmadi'}
                  </span>
                  <button 
                    onClick={() => handleDelete(test.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <h3 className="font-bold text-lg text-slate-900 mb-1">{test.title}</h3>
                <p className="text-sm text-slate-600 mb-4">{test.subject}</p>
                
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
                  <div>📅 {new Date(test.date).toLocaleDateString()}</div>
                  <div>📝 {test.questionCount} ta savol</div>
                  <div>✅ {test._count?.attempts || 0} ta topshirilgan</div>
                </div>
              </div>
              
              <div className="p-4 border-t bg-slate-50/50 rounded-b-xl flex justify-between items-center">
                <span className="text-xs text-slate-500 font-mono truncate max-w-[200px]">
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
