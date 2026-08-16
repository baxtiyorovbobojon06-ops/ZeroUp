"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Trash2, Users2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import toast from "react-hot-toast";

interface ClassItem {
  id: string;
  name: string;
  academicYear: string | null;
  description: string | null;
  createdAt: string;
  _count?: { students: number };
}

interface StudentItem {
  id: string;
  firstName: string;
  lastName: string;
  classId: string;
  createdAt: string;
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [students, setStudents] = useState<StudentItem[]>([]);

  // Forms
  const [showClassForm, setShowClassForm] = useState(false);
  const [className, setClassName] = useState("");
  const [classYear, setClassYear] = useState(new Date().getFullYear().toString());

  const [showStudentForm, setShowStudentForm] = useState(false);
  const [studentFirstName, setStudentFirstName] = useState("");
  const [studentLastName, setStudentLastName] = useState("");

  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);

  const fetchClasses = () => {
    fetch("/api/classes")
      .then(res => res.json())
      .then(data => {
        setClasses(data);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Sinflarni yuklashda xatolik");
        setLoading(false);
      });
  };

  const fetchStudents = (classId: string) => {
    Promise.resolve()
      .then(() => setStudentsLoading(true))
      .then(() => fetch(`/api/students?classId=${classId}`))
      .then(res => res.json())
      .then(data => {
        setStudents(data);
        setStudentsLoading(false);
      })
      .catch(() => {
        toast.error("O'quvchilarni yuklashda xatolik");
        setStudentsLoading(false);
      });
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents(selectedClass.id);
    }
  }, [selectedClass]);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) return toast.error("Sinf nomi kiritilishi shart");
    
    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: className, academicYear: classYear })
      });
      if (res.ok) {
        toast.success("Sinf muvaffaqiyatli yaratildi");
        setClassName("");
        setShowClassForm(false);
        fetchClasses();
      } else {
        toast.error("Xatolik yuz berdi");
      }
    } catch {
      toast.error("Xatolik yuz berdi");
    }
  };

  const handleDeleteClass = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Sinf va uning barcha o'quvchilari o'chib ketadi. Rozimisiz?")) return;
    
    try {
      const res = await fetch(`/api/classes/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Sinf o'chirildi");
        if (selectedClass?.id === id) setSelectedClass(null);
        fetchClasses();
      }
    } catch {
      toast.error("Xatolik yuz berdi");
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentFirstName.trim() || !studentLastName.trim()) return toast.error("Ism va familiya kiriting");
    if (!selectedClass) return;

    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          firstName: studentFirstName, 
          lastName: studentLastName,
          classId: selectedClass.id
        })
      });
      if (res.ok) {
        toast.success("O'quvchi qo'shildi");
        setStudentFirstName("");
        setStudentLastName("");
        setShowStudentForm(false);
        fetchStudents(selectedClass.id);
        fetchClasses(); // Update count
      }
    } catch {
      toast.error("Xatolik yuz berdi");
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm("O'quvchini o'chirasizmi?")) return;
    if (!selectedClass) return;

    try {
      const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("O'quvchi o'chirildi");
        fetchStudents(selectedClass.id);
        fetchClasses();
      }
    } catch {
      toast.error("Xatolik yuz berdi");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center shadow-sm">
          <Users2 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Sinflar va O&apos;quvchilar</h1>
          <p className="text-slate-500 dark:text-slate-400">Barcha sinflarni va ulardagi o&apos;quvchilarni boshqarish</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_2fr] gap-6">
        {/* Classes List Panel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Sinflar ({classes.length})</h2>
            <Button
              onClick={() => setShowClassForm(!showClassForm)}
              className="h-8 px-3 text-xs bg-indigo-600 hover:bg-indigo-700"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Qo&apos;shish
            </Button>
          </div>

          {showClassForm && (
            <Card className="p-4 bg-indigo-50/50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20">
              <form onSubmit={handleCreateClass} className="space-y-3">
                <Input
                  label="Sinf nomi (Masalan: 9-A)"
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="9-A"
                  autoFocus
                />
                <Input
                  label="O'quv yili"
                  type="text"
                  value={classYear}
                  onChange={(e) => setClassYear(e.target.value)}
                  placeholder="2026-2027"
                />
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" className="h-9 text-xs" onClick={() => setShowClassForm(false)}>Bekor qilish</Button>
                  <Button type="submit" className="h-9 text-xs bg-indigo-600 hover:bg-indigo-700">Saqlash</Button>
                </div>
              </form>
            </Card>
          )}

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <Skeleton className="w-2/3 h-5 mb-2" />
                  <Skeleton className="w-1/3 h-3" />
                </div>
              ))}
            </div>
          ) : classes.length === 0 ? (
            <EmptyState icon={Users} title="Hali sinflar yo'q" description="Yuqoridagi tugma orqali birinchi sinfingizni qo'shing." />
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
              {Array.isArray(classes) && classes.map(c => (
                <div
                  key={c.id}
                  onClick={() => setSelectedClass(c)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${
                    selectedClass?.id === c.id
                      ? "bg-primary text-white border-transparent shadow-md"
                      : "bg-white dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary/40 hover:shadow-sm"
                  }`}
                >
                  <div>
                    <h3 className="font-bold text-lg">{c.name}</h3>
                    <p className={`text-xs ${selectedClass?.id === c.id ? "text-white/80" : "text-slate-500 dark:text-slate-400"}`}>
                      {c.academicYear} • {c._count?.students || 0} o&apos;quvchi
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteClass(c.id, e)}
                    className={`p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${
                      selectedClass?.id === c.id ? "hover:bg-white/20 text-white/80" : "hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500"
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Students List Panel */}
        <div>
          {!selectedClass ? (
            <div className="h-full min-h-[400px] flex items-center justify-center">
              <EmptyState icon={BookOpen} title="Sinf tanlanmagan" description="O'quvchilarni ko'rish uchun chapdan sinfni tanlang" className="border-none bg-transparent" />
            </div>
          ) : (
            <Card className="h-full flex flex-col">
              <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{selectedClass.name} O&apos;quvchilari</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Jami {students.length} ta o&apos;quvchi</p>
                </div>
                <Button
                  onClick={() => setShowStudentForm(!showStudentForm)}
                  className="bg-emerald-600 hover:bg-emerald-700"
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  O&apos;quvchi qo&apos;shish
                </Button>
              </div>

              {showStudentForm && (
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-emerald-50/30 dark:bg-emerald-500/5">
                  <form onSubmit={handleAddStudent} className="flex items-end gap-3">
                    <div className="flex-1">
                      <Input
                        label="Ism"
                        type="text"
                        value={studentFirstName}
                        onChange={(e) => setStudentFirstName(e.target.value)}
                        placeholder="Ali"
                        autoFocus
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        label="Familiya"
                        type="text"
                        value={studentLastName}
                        onChange={(e) => setStudentLastName(e.target.value)}
                        placeholder="Valiyev"
                      />
                    </div>
                    <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 h-[46px]">Qo&apos;shish</Button>
                    <Button type="button" variant="outline" className="h-[46px]" onClick={() => setShowStudentForm(false)}>Yopish</Button>
                  </form>
                </div>
              )}

              <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">
                {studentsLoading ? (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                        <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                        <Skeleton className="w-2/3 h-4" />
                      </div>
                    ))}
                  </div>
                ) : students.length === 0 ? (
                  <EmptyState icon={Users} title="Bu sinfda hali o'quvchilar yo'q" description="Yuqoridagi tugma orqali o'quvchi qo'shing." className="border-none bg-transparent" />
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {students.map((student, idx) => (
                      <div key={student.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:border-emerald-200 dark:hover:border-emerald-500/40 hover:shadow-sm transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-100">{student.firstName} {student.lastName}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
