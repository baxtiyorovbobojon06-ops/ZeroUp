"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Radio } from "lucide-react";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function JoinPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    const cleanCode = code.trim();
    const cleanName = name.trim();

    if (!/^\d{6}$/.test(cleanCode)) {
      toast.error("6 xonali kodni to'g'ri kiriting");
      return;
    }
    if (!cleanName) {
      toast.error("Ismingizni kiriting");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/sessions/${cleanCode}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: cleanName }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Qo'shilib bo'lmadi");
        setLoading(false);
        return;
      }

      localStorage.setItem(`live_pid_${cleanCode}`, data.participantId);
      router.push(`/play/${cleanCode}?pid=${data.participantId}`);
    } catch {
      toast.error("Tarmoq xatoligi, qaytadan urinib ko'ring");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 mt-10">
      <div className="flex flex-col items-center gap-2 text-center">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ background: "var(--accent-bg-tint)", color: "var(--accent-primary-hover)" }}
        >
          <Radio className="w-6 h-6" />
        </div>
        <h1 className="text-lg font-medium text-[var(--text-primary)]">Testga qo&apos;shilish</h1>
        <p className="text-xs text-[var(--text-muted)]">O&apos;qituvchi bergan 6 xonali kodni kiriting</p>
      </div>

      <Card className="flex flex-col gap-4">
        <Input
          label="Kod"
          inputMode="numeric"
          maxLength={6}
          placeholder="482913"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          className="text-center text-xl tracking-[0.3em] font-medium"
        />
        <Input
          label="Ismingiz"
          placeholder="Ism Familiya"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
        />
        <Button className="w-full" onClick={handleJoin} isLoading={loading}>
          Qo&apos;shilish
        </Button>
      </Card>
    </div>
  );
}
