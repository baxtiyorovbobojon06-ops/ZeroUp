"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Plus, Trash2, Users, ChevronDown, ClipboardList, Sparkles, AlertCircle, Upload, X, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import toast from "react-hot-toast";
import type { ClassTestResult, GradeLevel, WeakTopicRecommendation } from "@/lib/types/classResults";

const GRADE_LABEL: Record<GradeLevel, string> = {
  aLo: "A'lo",
  yaxshi: "Yaxshi",
  yomon: "Yomon",
};

const GRADE_STYLE: Record<GradeLevel, React.CSSProperties> = {
  aLo: { background: "var(--success-bg)", color: "var(--success-text)" },
  yaxshi: { background: "var(--accent-bg-tint)", color: "var(--accent-primary-hover)" },
  yomon: { background: "var(--danger-bg)", color: "var(--danger-text)" },
};

type TestResultsState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; data: ClassTestResult[] };

type WeakTopicsState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; data: WeakTopicRecommendation };

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

interface ExtractedStudent {
  firstName: string;
  lastName: string;
}

async function extractStudentsFromImages(files: File[]): Promise<ExtractedStudent[]> {
  const imagesData = await Promise.all(files.map(file => {
    return new Promise<{ data: string; mimeType: string }>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve({
        data: (reader.result as string).split(',')[1],
        mimeType: file.type
      });
      reader.readAsDataURL(file);
    });
  }));

  const res = await fetch('/api/students/extract-from-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ images: imagesData })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Rasmni tahlil qilishda xatolik");
  return (data.students || []) as ExtractedStudent[];
}

export default function ClassesPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [students, setStudents] = useState<StudentItem[]>([]);

  const [showClassForm, setShowClassForm] = useState(false);
  const [className, setClassName] = useState("");
  const [classYear, setClassYear] = useState(new Date().getFullYear().toString());
  const [creatingClass, setCreatingClass] = useState(false);

  const [newClassRoster, setNewClassRoster] = useState<ExtractedStudent[]>([]);
  const [newRosterFirstName, setNewRosterFirstName] = useState("");
  const [newRosterLastName, setNewRosterLastName] = useState("");
  const [classRosterFiles, setClassRosterFiles] = useState<File[]>([]);
  const [classExtracting, setClassExtracting] = useState(false);
  const [classExtractError, setClassExtractError] = useState("");

  const [showStudentForm, setShowStudentForm] = useState(false);
  const [studentAddMode, setStudentAddMode] = useState<"manual" | "image">("manual");
  const [studentFirstName, setStudentFirstName] = useState("");
  const [studentLastName, setStudentLastName] = useState("");

  const [rosterFiles, setRosterFiles] = useState<File[]>([]);
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState("");
  const [extractedStudents, setExtractedStudents] = useState<ExtractedStudent[]>([]);
  const [savingBulk, setSavingBulk] = useState(false);

  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);

  const [testResults, setTestResults] = useState<TestResultsState>({ status: "idle" });
  const [expandedTests, setExpandedTests] = useState<Set<string>>(new Set());
  const [weakTopics, setWeakTopics] = useState<Record<string, WeakTopicsState>>({});

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

  const fetchTestResults = (classId: string) => {
    Promise.resolve()
      .then(() => {
        setTestResults({ status: "loading" });
        setExpandedTests(new Set());
        setWeakTopics({});
      })
      .then(() => fetch(`/api/classes/${classId}/test-results`))
      .then(res => res.json())
      .then((data: ClassTestResult[]) => setTestResults({ status: "ready", data }))
      .catch(() => setTestResults({ status: "error" }));
  };

  const loadWeakTopics = (testId: string, studentId: string) => {
    const key = `${testId}:${studentId}`;
    Promise.resolve()
      .then(() => setWeakTopics(prev => ({ ...prev, [key]: { status: "loading" } })))
      .then(() => fetch(`/api/tests/${testId}/weak-topics?studentId=${studentId}`))
      .then(res => {
        if (!res.ok) throw new Error("failed");
        return res.json();
      })
      .then((data: WeakTopicRecommendation) => setWeakTopics(prev => ({ ...prev, [key]: { status: "ready", data } })))
      .catch(() => setWeakTopics(prev => ({ ...prev, [key]: { status: "error" } })));
  };

  const toggleTestExpanded = (testId: string) => {
    setExpandedTests(prev => {
      const next = new Set(prev);
      if (next.has(testId)) next.delete(testId);
      else next.add(testId);
      return next;
    });
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents(selectedClass.id);
      fetchTestResults(selectedClass.id);
    }
  }, [selectedClass]);

  const resetClassForm = () => {
    setClassName("");
    setClassYear(new Date().getFullYear().toString());
    setNewClassRoster([]);
    setNewRosterFirstName("");
    setNewRosterLastName("");
    setClassRosterFiles([]);
    setClassExtractError("");
    setShowClassForm(false);
  };

  const addManualRosterRow = () => {
    if (!newRosterFirstName.trim() || !newRosterLastName.trim()) {
      return toast.error("Ism va familiya kiriting");
    }
    setNewClassRoster(prev => [...prev, { firstName: newRosterFirstName.trim(), lastName: newRosterLastName.trim() }]);
    setNewRosterFirstName("");
    setNewRosterLastName("");
  };

  const updateNewClassRosterRow = (index: number, field: keyof ExtractedStudent, value: string) => {
    setNewClassRoster(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const removeNewClassRosterRow = (index: number) => {
    setNewClassRoster(prev => prev.filter((_, i) => i !== index));
  };

  const handleClassRosterFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles = newFiles.filter(f => f.type.startsWith('image/'));

      if (validFiles.length !== newFiles.length) {
        toast.error("Iltimos, faqat rasm formatidagi fayllarni yuklang (JPG, PNG)");
      }

      setClassRosterFiles(prev => {
        const total = [...prev, ...validFiles];
        if (total.length > 10) {
          toast.error("Maksimal 10 tagacha rasm yuklash mumkin");
          return total.slice(0, 10);
        }
        return total;
      });
      e.target.value = '';
    }
  };

  const removeClassRosterFile = (index: number) => {
    setClassRosterFiles(files => files.filter((_, i) => i !== index));
  };

  const handleExtractClassRoster = async () => {
    if (classRosterFiles.length === 0) return toast.error("Kamida bitta rasm yuklang");

    setClassExtracting(true);
    setClassExtractError("");

    try {
      const found = await extractStudentsFromImages(classRosterFiles);
      if (found.length === 0) {
        toast.error("Rasmdan ism-familiya topilmadi");
      } else {
        setNewClassRoster(prev => [...prev, ...found]);
        setClassRosterFiles([]);
      }
    } catch (err) {
      setClassExtractError(err instanceof Error ? err.message : "Rasmni tahlil qilishda xatolik");
    } finally {
      setClassExtracting(false);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) return toast.error("Sinf nomi kiritilishi shart");

    setCreatingClass(true);
    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: className, academicYear: classYear })
      });

      if (!res.ok) {
        toast.error("Xatolik yuz berdi");
        return;
      }

      const newClass = await res.json();
      const validStudents = newClassRoster.filter(s => s.firstName.trim() && s.lastName.trim());

      if (validStudents.length > 0) {
        const bulkRes = await fetch("/api/students/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ classId: newClass.id, students: validStudents })
        });
        if (!bulkRes.ok) {
          toast.error("Sinf yaratildi, lekin o'quvchilarni qo'shishda xatolik yuz berdi");
        }
      }

      toast.success(validStudents.length > 0 ? `Sinf va ${validStudents.length} ta o'quvchi qo'shildi` : "Sinf muvaffaqiyatli yaratildi");
      resetClassForm();
      fetchClasses();
    } catch {
      toast.error("Xatolik yuz berdi");
    } finally {
      setCreatingClass(false);
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
        resetStudentForm();
        fetchStudents(selectedClass.id);
        fetchClasses();
      }
    } catch {
      toast.error("Xatolik yuz berdi");
    }
  };

  const resetStudentForm = () => {
    setStudentFirstName("");
    setStudentLastName("");
    setRosterFiles([]);
    setExtractError("");
    setExtractedStudents([]);
    setStudentAddMode("manual");
    setShowStudentForm(false);
  };

  const handleRosterFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles = newFiles.filter(f => f.type.startsWith('image/'));

      if (validFiles.length !== newFiles.length) {
        toast.error("Iltimos, faqat rasm formatidagi fayllarni yuklang (JPG, PNG)");
      }

      setRosterFiles(prev => {
        const total = [...prev, ...validFiles];
        if (total.length > 10) {
          toast.error("Maksimal 10 tagacha rasm yuklash mumkin");
          return total.slice(0, 10);
        }
        return total;
      });
      e.target.value = '';
    }
  };

  const removeRosterFile = (index: number) => {
    setRosterFiles(files => files.filter((_, i) => i !== index));
  };

  const handleExtractStudents = async () => {
    if (rosterFiles.length === 0) return toast.error("Kamida bitta rasm yuklang");

    setExtracting(true);
    setExtractError("");

    try {
      const found = await extractStudentsFromImages(rosterFiles);
      setExtractedStudents(found);
      if (found.length === 0) toast.error("Rasmdan ism-familiya topilmadi");
    } catch (err) {
      setExtractError(err instanceof Error ? err.message : "Rasmni tahlil qilishda xatolik");
    } finally {
      setExtracting(false);
    }
  };

  const updateExtractedStudent = (index: number, field: keyof ExtractedStudent, value: string) => {
    setExtractedStudents(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const removeExtractedStudent = (index: number) => {
    setExtractedStudents(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveExtractedStudents = async () => {
    if (!selectedClass) return;
    const valid = extractedStudents.filter(s => s.firstName.trim() && s.lastName.trim());
    if (valid.length === 0) return toast.error("Kamida bitta to'liq ism-familiya kiriting");

    setSavingBulk(true);
    try {
      const res = await fetch('/api/students/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId: selectedClass.id, students: valid })
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`${data.count} ta o'quvchi qo'shildi`);
        resetStudentForm();
        fetchStudents(selectedClass.id);
        fetchClasses();
      } else {
        toast.error("Saqlashda xatolik yuz berdi");
      }
    } catch {
      toast.error("Saqlashda xatolik yuz berdi");
    } finally {
      setSavingBulk(false);
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

      <Button
        className="w-full"
        leftIcon={<Plus className="w-4 h-4" />}
        onClick={() => showClassForm ? resetClassForm() : setShowClassForm(true)}
      >
        Yangi sinf qo&apos;shish
      </Button>

      {showClassForm && (
        <Card className="space-y-4">
          <form onSubmit={handleCreateClass} className="space-y-4">
            <div className="space-y-3">
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
            </div>

            <div className="space-y-2.5 pt-1 border-t-[0.5px]" style={{ borderColor: "var(--card-border)" }}>
              <p className="text-xs font-medium text-[var(--text-secondary)] pt-2.5">O&apos;quvchilar (ixtiyoriy)</p>

              <div className="flex items-end gap-2">
                <Input
                  label="Ism"
                  type="text"
                  value={newRosterFirstName}
                  onChange={(e) => setNewRosterFirstName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addManualRosterRow(); } }}
                  placeholder="Ali"
                  className="flex-1"
                />
                <Input
                  label="Familiya"
                  type="text"
                  value={newRosterLastName}
                  onChange={(e) => setNewRosterLastName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addManualRosterRow(); } }}
                  placeholder="Valiyev"
                  className="flex-1"
                />
                <Button type="button" variant="secondary" onClick={addManualRosterRow} className="shrink-0 px-3">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div
                className="border-2 border-dashed rounded-[var(--radius-card)] p-4 text-center cursor-pointer"
                style={{ borderColor: "var(--input-border)" }}
                onClick={() => document.getElementById('new-class-roster-upload')?.click()}
              >
                <Upload className="w-5 h-5 mx-auto mb-1" style={{ color: "var(--accent-primary)" }} />
                <p className="text-xs font-medium text-[var(--text-primary)]">Ro&apos;yxat rasmini yuklab, ism-familiyalarni AI bilan aniqlang</p>
                <input
                  id="new-class-roster-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleClassRosterFileChange}
                />
              </div>

              {classRosterFiles.length > 0 && (
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-2">
                    {classRosterFiles.map((file, idx) => (
                      <div key={idx} className="relative rounded-lg overflow-hidden border-[0.5px] aspect-square" style={{ borderColor: "var(--card-border)" }}>
                        <Image src={URL.createObjectURL(file)} alt="preview" fill unoptimized className="object-cover" />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeClassRosterFile(idx); }}
                          className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    isLoading={classExtracting}
                    leftIcon={<ScanLine className="w-4 h-4" />}
                    onClick={handleExtractClassRoster}
                  >
                    {classExtracting ? "Aniqlanmoqda..." : "Ismlarni aniqlash"}
                  </Button>
                </div>
              )}

              {classExtractError && (
                <div className="p-3 rounded-[var(--radius)] text-sm flex items-start gap-2" style={{ background: "var(--danger-bg)", color: "var(--danger-text)" }}>
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>{classExtractError}</p>
                </div>
              )}

              {newClassRoster.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-[var(--text-muted)]">{newClassRoster.length} ta o&apos;quvchi qo&apos;shiladi:</p>
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {newClassRoster.map((s, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Input
                          value={s.firstName}
                          onChange={(e) => updateNewClassRosterRow(idx, "firstName", e.target.value)}
                          placeholder="Ism"
                          className="flex-1"
                        />
                        <Input
                          value={s.lastName}
                          onChange={(e) => updateNewClassRosterRow(idx, "lastName", e.target.value)}
                          placeholder="Familiya"
                          className="flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewClassRosterRow(idx)}
                          className="p-1.5 text-[var(--text-muted)] hover:text-[var(--danger-text)] shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="secondary" onClick={resetClassForm}>Bekor qilish</Button>
              <Button type="submit" isLoading={creatingClass}>Saqlash</Button>
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
              onClick={() => showStudentForm ? resetStudentForm() : setShowStudentForm(true)}
              className="text-xs font-medium flex items-center gap-1"
              style={{ color: "var(--accent-primary)" }}
            >
              <Plus className="w-3.5 h-3.5" /> Qo&apos;shish
            </button>
          </div>

          {showStudentForm && (
            <Card className="space-y-3">
              <div className="flex gap-2 p-1 rounded-[var(--radius)]" style={{ background: "var(--input-bg)" }}>
                <button
                  type="button"
                  onClick={() => setStudentAddMode("manual")}
                  className="flex-1 py-1.5 rounded-[calc(var(--radius)-2px)] text-xs font-medium"
                  style={studentAddMode === "manual"
                    ? { background: "var(--card-bg)", color: "var(--text-primary)" }
                    : { color: "var(--text-muted)" }}
                >
                  Qo&apos;lda kiritish
                </button>
                <button
                  type="button"
                  onClick={() => setStudentAddMode("image")}
                  className="flex-1 py-1.5 rounded-[calc(var(--radius)-2px)] text-xs font-medium"
                  style={studentAddMode === "image"
                    ? { background: "var(--card-bg)", color: "var(--text-primary)" }
                    : { color: "var(--text-muted)" }}
                >
                  Rasmdan kiritish
                </button>
              </div>

              {studentAddMode === "manual" ? (
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
                    <Button type="button" variant="secondary" onClick={resetStudentForm}>Bekor qilish</Button>
                    <Button type="submit">Saqlash</Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-[var(--text-muted)]">
                    Sinf ro&apos;yxati yozilgan rasmni (jurnal, qog&apos;ozga yozilgan ro&apos;yxat va h.k.) yuklang —
                    AI ism-familiyalarni avtomatik aniqlab beradi.
                  </p>

                  <div
                    className="border-2 border-dashed rounded-[var(--radius-card)] p-5 text-center cursor-pointer"
                    style={{ borderColor: "var(--input-border)" }}
                    onClick={() => document.getElementById('roster-upload')?.click()}
                  >
                    <Upload className="w-6 h-6 mx-auto mb-1.5" style={{ color: "var(--accent-primary)" }} />
                    <p className="text-sm font-medium text-[var(--text-primary)]">Rasmlarni yuklash</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">Ko&apos;pi bilan 10 ta rasm</p>
                    <input
                      id="roster-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleRosterFileChange}
                    />
                  </div>

                  {rosterFiles.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {rosterFiles.map((file, idx) => (
                        <div key={idx} className="relative rounded-lg overflow-hidden border-[0.5px] aspect-square" style={{ borderColor: "var(--card-border)" }}>
                          <Image src={URL.createObjectURL(file)} alt="preview" fill unoptimized className="object-cover" />
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeRosterFile(idx); }}
                            className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center"
                          >
                            <X className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {extractError && (
                    <div className="p-3 rounded-[var(--radius)] text-sm flex items-start gap-2" style={{ background: "var(--danger-bg)", color: "var(--danger-text)" }}>
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <p>{extractError}</p>
                    </div>
                  )}

                  {extractedStudents.length === 0 ? (
                    <div className="flex gap-2 justify-end">
                      <Button type="button" variant="secondary" onClick={resetStudentForm}>Bekor qilish</Button>
                      <Button
                        type="button"
                        isLoading={extracting}
                        leftIcon={<ScanLine className="w-4 h-4" />}
                        disabled={rosterFiles.length === 0}
                        onClick={handleExtractStudents}
                      >
                        {extracting ? "Aniqlanmoqda..." : "Ismlarni aniqlash"}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-[var(--text-muted)]">
                        {extractedStudents.length} ta o&apos;quvchi topildi — kerak bo&apos;lsa tuzating:
                      </p>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {extractedStudents.map((s, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Input
                              value={s.firstName}
                              onChange={(e) => updateExtractedStudent(idx, "firstName", e.target.value)}
                              placeholder="Ism"
                              className="flex-1"
                            />
                            <Input
                              value={s.lastName}
                              onChange={(e) => updateExtractedStudent(idx, "lastName", e.target.value)}
                              placeholder="Familiya"
                              className="flex-1"
                            />
                            <button
                              type="button"
                              onClick={() => removeExtractedStudent(idx)}
                              className="p-1.5 text-[var(--text-muted)] hover:text-[var(--danger-text)] shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 justify-end pt-1">
                        <Button type="button" variant="secondary" onClick={resetStudentForm}>Bekor qilish</Button>
                        <Button type="button" isLoading={savingBulk} onClick={handleSaveExtractedStudents}>
                          Hammasini saqlash
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
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

          <div className="space-y-2 pt-2">
            <h2 className="text-sm font-medium text-[var(--text-primary)]">Test natijalari</h2>

            {testResults.status === "loading" && (
              <div className="space-y-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-[var(--radius-card)]" />
                ))}
              </div>
            )}

            {testResults.status === "error" && (
              <Card className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm text-[var(--danger-text)]">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  Test natijalarini yuklab bo&apos;lmadi
                </div>
                <Button
                  variant="secondary"
                  onClick={() => fetchTestResults(selectedClass.id)}
                  className="shrink-0 py-1.5 px-3 text-sm"
                >
                  Qayta urinish
                </Button>
              </Card>
            )}

            {testResults.status === "ready" && testResults.data.length === 0 && (
              <EmptyState
                icon={ClipboardList}
                title="Hali tekshirilgan test yo'q"
                description="Tekshirish bo'limida javob varaqalarini tekshirgach, natijalar shu yerda ko'rinadi."
              />
            )}

            {testResults.status === "ready" && testResults.data.map((test) => {
              const isExpanded = expandedTests.has(test.testId);
              return (
                <Card key={test.testId} className="p-0 overflow-hidden">
                  <button
                    onClick={() => toggleTestExpanded(test.testId)}
                    className="w-full p-4 flex items-center justify-between gap-3 text-left"
                  >
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{test.sarlavha}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        {test.fan} • {test.natijalar.length} ta o&apos;quvchi
                      </p>
                    </div>
                    <ChevronDown
                      className="w-4 h-4 text-[var(--text-muted)] transition-transform shrink-0"
                      style={{ transform: isExpanded ? "rotate(180deg)" : "none" }}
                    />
                  </button>

                  {isExpanded && (
                    <div className="divide-y" style={{ borderColor: "var(--card-border)" }}>
                      {test.natijalar.map((n) => {
                        const key = `${test.testId}:${n.studentId}`;
                        const wt = weakTopics[key];
                        return (
                          <div key={n.studentId} className="p-4 space-y-2">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-sm font-medium text-[var(--text-primary)]">{n.ism}</p>
                                {n.baho === "yomon" && n.xatoSavollar.length > 0 && (
                                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                                    Xato savollar: {n.xatoSavollar.map(x => x.savolRaqami).join(", ")}
                                  </p>
                                )}
                              </div>
                              <span
                                className="text-xs font-medium px-2 py-1 rounded-full shrink-0"
                                style={GRADE_STYLE[n.baho]}
                              >
                                {GRADE_LABEL[n.baho]} • {n.foiz}%
                              </span>
                            </div>

                            {n.baho === "yomon" && n.xatoSavollar.length > 0 && (
                              <>
                                {!wt && (
                                  <button
                                    onClick={() => loadWeakTopics(test.testId, n.studentId)}
                                    className="text-xs font-medium flex items-center gap-1"
                                    style={{ color: "var(--accent-primary)" }}
                                  >
                                    <Sparkles className="w-3.5 h-3.5" /> Mavzularni ko&apos;rish
                                  </button>
                                )}

                                {wt?.status === "loading" && (
                                  <p className="text-xs text-[var(--text-muted)] animate-pulse">Tahlil qilinmoqda...</p>
                                )}

                                {wt?.status === "error" && (
                                  <div className="flex items-center justify-between gap-3">
                                    <span className="text-xs text-[var(--danger-text)]">Tahlil qilib bo&apos;lmadi</span>
                                    <button
                                      onClick={() => loadWeakTopics(test.testId, n.studentId)}
                                      className="text-xs font-medium"
                                      style={{ color: "var(--accent-primary)" }}
                                    >
                                      Qayta urinish
                                    </button>
                                  </div>
                                )}

                                {wt?.status === "ready" && (
                                  <div className="p-3 rounded-[var(--radius)] space-y-1.5" style={{ background: "var(--accent-bg-tint)" }}>
                                    {wt.data.mavzular.length > 0 && (
                                      <div className="flex flex-wrap gap-1.5">
                                        {wt.data.mavzular.map((m, i) => (
                                          <span
                                            key={i}
                                            className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                                            style={{ background: "var(--card-bg)", color: "var(--accent-primary-hover)" }}
                                          >
                                            {m}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                    <p className="text-xs text-[var(--text-secondary)]">{wt.data.tavsiya}</p>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
