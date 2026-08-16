"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Trash2, Edit2, Users2, Search, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import toast from "react-hot-toast";

export default function ClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  
  // Forms
  const [showClassForm, setShowClassForm] = useState(false);
  const [className, setClassName] = useState("");
  const [classYear, setClassYear] = useState(new Date().getFullYear().toString());
  
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [studentFirstName, setStudentFirstName] = useState("");
  const [studentLastName, setStudentLastName] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents(selectedClass.id);
    } else {
      setStudents([]);
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const res = await fetch("/api/classes");
      const data = await res.json();
      setClasses(data);
      setLoading(false);
    } catch (err) {
      toast.error("Sinflarni yuklashda xatolik");
      setLoading(false);
    }
  };

  const fetchStudents = async (classId: string) => {
    setStudentsLoading(true);
    try {
      const res = await fetch(`/api/students?classId=${classId}`);
      const data = await res.json();
      setStudents(data);
      setStudentsLoading(false);
    } catch (err) {
      toast.error("O'quvchilarni yuklashda xatolik");
      setStudentsLoading(false);
    }
  };

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
    } catch (err) {
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
    } catch (err) {
      toast.error("Xatolik yuz berdi");
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentFirstName.trim() || !studentLastName.trim()) return toast.error("Ism va familiya kiriting");
    
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
    } catch (err) {
      toast.error("Xatolik yuz berdi");
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm("O'quvchini o'chirasizmi?")) return;
    
    try {
      const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("O'quvchi o'chirildi");
        fetchStudents(selectedClass.id);
        fetchClasses();
      }
    } catch (err) {
      toast.error("Xatolik yuz berdi");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
          <Users2 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sinflar va O'quvchilar</h1>
          <p className="text-slate-500">Barcha sinflarni va ulardagi o'quvchilarni boshqarish</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_2fr] gap-6">
        {/* Classes List Panel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Sinflar ({classes.length})</h2>
            <Button 
              onClick={() => setShowClassForm(!showClassForm)}
              className="h-8 px-3 text-xs bg-indigo-600 hover:bg-indigo-700"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Qo'shish
            </Button>
          </div>

          {showClassForm && (
            <Card className="p-4 bg-indigo-50/50 border-indigo-100">
              <form onSubmit={handleCreateClass} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Sinf nomi (Masalan: 9-A)</label>
                  <input 
                    type="text" 
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="9-A"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">O'quv yili</label>
                  <input 
                    type="text" 
                    value={classYear}
                    onChange={(e) => setClassYear(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="2026-2027"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" className="h-8 text-xs" onClick={() => setShowClassForm(false)}>Bekor qilish</Button>
                  <Button type="submit" className="h-8 text-xs bg-indigo-600">Saqlash</Button>
                </div>
              </form>
            </Card>
          )}

          {loading ? (
            <div className="flex justify-center p-8 text-slate-400">Yuklanmoqda...</div>
          ) : classes.length === 0 ? (
            <div className="text-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Hali sinflar yo'q</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
              {Array.isArray(classes) && classes.map(c => (
                <div 
                  key={c.id} 
                  onClick={() => setSelectedClass(c)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${
                    selectedClass?.id === c.id 
                      ? "bg-indigo-600 text-white border-indigo-700 shadow-md" 
                      : "bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:shadow-sm"
                  }`}
                >
                  <div>
                    <h3 className="font-bold text-lg">{c.name}</h3>
                    <p className={`text-xs ${selectedClass?.id === c.id ? "text-indigo-200" : "text-slate-500"}`}>
                      {c.academicYear} • {c._count?.students || 0} o'quvchi
                    </p>
                  </div>
                  <button 
                    onClick={(e) => handleDeleteClass(c.id, e)}
                    className={`p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${
                      selectedClass?.id === c.id ? "hover:bg-indigo-700 text-indigo-200" : "hover:bg-red-50 text-slate-400 hover:text-red-500"
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
            <div className="h-full flex items-center justify-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 min-h-[400px]">
              <div className="text-center">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-medium text-slate-600">Sinf tanlanmagan</h3>
                <p className="text-sm text-slate-500 mt-1">O'quvchilarni ko'rish uchun chapdan sinfni tanlang</p>
              </div>
            </div>
          ) : (
            <Card className="h-full flex flex-col">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{selectedClass.name} O'quvchilari</h2>
                  <p className="text-sm text-slate-500">Jami {students.length} ta o'quvchi</p>
                </div>
                <Button 
                  onClick={() => setShowStudentForm(!showStudentForm)}
                  className="bg-emerald-600 hover:bg-emerald-700"
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  O'quvchi qo'shish
                </Button>
              </div>

              {showStudentForm && (
                <div className="p-4 border-b border-slate-100 bg-emerald-50/30">
                  <form onSubmit={handleAddStudent} className="flex items-end gap-3">
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-slate-600">Ism</label>
                      <input 
                        type="text" 
                        value={studentFirstName}
                        onChange={(e) => setStudentFirstName(e.target.value)}
                        className="w-full mt-1 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        placeholder="Ali"
                        autoFocus
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-slate-600">Familiya</label>
                      <input 
                        type="text" 
                        value={studentLastName}
                        onChange={(e) => setStudentLastName(e.target.value)}
                        className="w-full mt-1 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        placeholder="Valiyev"
                      />
                    </div>
                    <Button type="submit" className="bg-emerald-600 h-[38px]">Qo'shish</Button>
                    <Button type="button" variant="outline" className="h-[38px]" onClick={() => setShowStudentForm(false)}>Yopish</Button>
                  </form>
                </div>
              )}

              <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">
                {studentsLoading ? (
                  <div className="flex justify-center p-8 text-slate-400">Yuklanmoqda...</div>
                ) : students.length === 0 ? (
                  <div className="text-center p-12">
                    <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-500">Bu sinfda hali o'quvchilar yo'q</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {students.map((student, idx) => (
                      <div key={student.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white hover:border-emerald-200 hover:shadow-sm transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{student.firstName} {student.lastName}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDeleteStudent(student.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-all"
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
