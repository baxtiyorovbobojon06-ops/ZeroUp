"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Radio, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LiveSetupPage() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [topic, setTopic] = useState("");
  const [questionCount, setQuestionCount] = useState("10");
  const [difficulty, setDifficulty] = useState("O'rta");
  const [durationMin, setDurationMin] = useState("5");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !topic) {
      toast.error("Fan va mavzuni to'ldiring");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          grade,
          topic,
          questionCount,
          difficulty,
          durationSec: parseInt(durationMin) * 60,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Test yaratib bo'lmadi");
        setLoading(false);
        return;
      }
      router.push(`/live/${data.code}`);
    } catch {
      toast.error("Tarmoq xatoligi, qaytadan urinib ko'ring");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1 text-[var(--text-secondary)]">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-medium text-[var(--text-primary)]">Jonli test</h1>
          <p className="text-xs text-[var(--text-muted)]">Kod orqali o&apos;quvchilar real vaqtda ishtirok etadi</p>
        </div>
      </div>

      <Card className="flex flex-col items-center gap-2 text-center py-6">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ background: "var(--accent-bg-tint)", color: "var(--accent-primary-hover)" }}
        >
          <Radio className="w-5 h-5" />
        </div>
        <p className="text-xs text-[var(--text-muted)] max-w-[280px]">
          Mavzuni tanlang, AI savollarni tayyorlaydi. Har bir o&apos;quvchiga turli tartibdagi savollar beriladi.
        </p>
      </Card>

      <Card>
        <form onSubmit={handleCreate} className="space-y-3">
          <Input label="Fan" required value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Masalan: Matematika" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Sinf" value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="Masalan: 7" />
            <Select label="Qiyinlik" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option value="Oson">Oson</option>
              <option value="O'rta">O&apos;rta</option>
              <option value="Qiyin">Qiyin</option>
            </Select>
          </div>
          <Input label="Mavzu" required value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Masalan: Kasrlar" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Savollar soni" type="number" min="1" max="30" value={questionCount} onChange={(e) => setQuestionCount(e.target.value)} />
            <Input label="Vaqt (daqiqa)" type="number" min="1" max="60" value={durationMin} onChange={(e) => setDurationMin(e.target.value)} />
          </div>

          <Button type="submit" className="w-full" isLoading={loading} leftIcon={<Sparkles className="w-4 h-4" />}>
            {loading ? "Yaratilmoqda..." : "Test yaratish va kod olish"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
