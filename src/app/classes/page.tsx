"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Users } from "lucide-react";
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
  const router = useRouter();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [students, setStudents] = useState<StudentItem[]>([]);

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
        fetchClasses();
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
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1 text-[var(--text-secondary)]">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-medium text-[var(--text-primary)]">Sinflar</h1>
          <p className="text-xs text-[var(--text-muted)]">Barcha sinflarni va o&apos;quvchilarni boshqarish</p>
        </div>
      </div>

      <Button className="w-full" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowClassForm(!showClassForm)}>
        Yangi sinf qo&apos;shish
      </Button>

      {showClassForm && (
        <Card className="space-y-3">
          <form onSubmit={handleCreateClass} className="space-y-3">
            <Input
              label="Sinf nomi"
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="Masalan: 9-A"
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
              <Button type="button" variant="secondary" onClick={() => setShowClassForm(false)}>Bekor qilish</Button>
              <Button type="submit">Saqlash</Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-[var(--radius-card)]" />
          ))}
        </div>
      ) : classes.length === 0 ? (
        <EmptyState icon={Users} title="Hali sinflar yo'q" description="Yuqoridagi tugma orqali birinchi sinfingizni qo'shing." />
      ) : (
        <div className="space-y-2">
          {classes.map(c => {
            const isSelected = selectedClass?.id === c.id;
            return (
              <div
                key={c.id}
                onClick={() => setSelectedClass(isSelected ? null : c)}
                className="p-4 rounded-[var(--radius-card)] border cursor-pointer flex items-center justify-between group"
                style={isSelected
                  ? { background: "var(--accent-bg-tint)", borderColor: "var(--accent-bg-strong)" }
                  : { background: "var(--card-bg)", borderColor: "var(--card-border)" }}
              >
                <div>
                  <h3 className="font-medium text-[var(--text-primary)]">{c.name}</h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    {c.academicYear} • {c._count?.students || 0} o&apos;quvchi
                  </p>
                </div>
                <button
                  onClick={(e) => handleDeleteClass(c.id, e)}
                  className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--danger-text)]"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {selectedClass && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-[var(--text-primary)]">{selectedClass.name} o&apos;quvchilari</h2>
            <button
              onClick={() => setShowStudentForm(!showStudentForm)}
              className="text-xs font-medium flex items-center gap-1"
              style={{ color: "var(--accent-primary)" }}
            >
              <Plus className="w-3.5 h-3.5" /> Qo&apos;shish
            </button>
          </div>

          {showStudentForm && (
            <Card className="space-y-3">
              <form onSubmit={handleAddStudent} className="space-y-3">
                <Input
                  label="Ism"
                  type="text"
                  value={studentFirstName}
                  onChange={(e) => setStudentFirstName(e.target.value)}
                  placeholder="Ali"
                  autoFocus
                />
                <Input
                  label="Familiya"
                  type="text"
                  value={studentLastName}
                  onChange={(e) => setStudentLastName(e.target.value)}
                  placeholder="Valiyev"
                />
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="secondary" onClick={() => setShowStudentForm(false)}>Bekor qilish</Button>
                  <Button type="submit">Saqlash</Button>
                </div>
              </form>
            </Card>
          )}

          {studentsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-[var(--radius-card)]" />
              ))}
            </div>
          ) : students.length === 0 ? (
            <EmptyState icon={Users} title="Bu sinfda hali o'quvchilar yo'q" description="Yuqoridagi tugma orqali o'quvchi qo'shing." />
          ) : (
            <div className="space-y-2">
              {students.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 rounded-[var(--radius-card)] bg-[var(--card-bg)] border-[0.5px] border-[var(--card-border)]">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0"
                      style={{ background: "var(--accent-bg-tint)", color: "var(--accent-primary-hover)" }}
                    >
                      {student.firstName.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{student.firstName} {student.lastName}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteStudent(student.id)}
                    className="p-1.5 text-[var(--text-muted)] hover:text-[var(--danger-text)]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
