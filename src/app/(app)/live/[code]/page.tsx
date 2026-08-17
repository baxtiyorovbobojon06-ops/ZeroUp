"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Users2, Play, Square, Copy, Clock, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface Participant {
  id: string;
  name: string;
  submittedAt: string | null;
  score: number | null;
  correctCount: number | null;
}

interface SessionInfo {
  subject: string;
  topic: string;
  status: "waiting" | "active" | "finished";
  durationSec: number;
  endsAt: string | null;
  questionCount: number;
  participants: Participant[];
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function LiveControlPage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!code) return;
    const load = async () => {
      const res = await fetch(`/api/sessions/${code}`);
      if (res.ok) {
        setSession(await res.json());
      } else if (res.status === 404) {
        toast.error("Bunday kodli test topilmadi");
      }
    };
    load();
    const interval = setInterval(load, 2500);
    return () => clearInterval(interval);
  }, [code]);

  useEffect(() => {
    if (!session?.endsAt) return;
    const tick = () => {
      const diff = Math.max(0, Math.floor((new Date(session.endsAt!).getTime() - Date.now()) / 1000));
      setRemaining(diff);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [session?.endsAt]);

  const runAction = async (action: "start" | "finish") => {
    setBusy(true);
    try {
      const res = await fetch(`/api/sessions/${code}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Amalni bajarib bo'lmadi");
      } else {
        setSession((prev) => (prev ? { ...prev, status: data.status, endsAt: data.endsAt } : prev));
      }
    } catch {
      toast.error("Tarmoq xatoligi");
    } finally {
      setBusy(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    toast.success("Kod nusxalandi");
  };

  if (!session) {
    return <Card><p className="text-sm text-[var(--text-muted)]">Yuklanmoqda...</p></Card>;
  }

  const submittedCount = session.participants.filter((p) => p.submittedAt).length;
  const sorted = [...session.participants].sort((a, b) => (b.score ?? -1) - (a.score ?? -1));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push("/live")} className="p-1 text-[var(--text-secondary)]">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-medium text-[var(--text-primary)]">{session.subject}</h1>
          <p className="text-xs text-[var(--text-muted)]">{session.topic} · {session.questionCount} ta savol</p>
        </div>
      </div>

      <Card className="flex flex-col items-center gap-2 py-6">
        <span className="text-xs text-[var(--text-muted)]">Ishtirokchilar uchun kod</span>
        <button onClick={copyCode} className="flex items-center gap-2 text-3xl font-medium tracking-[0.3em]" style={{ color: "var(--accent-primary-hover)" }}>
          {code} <Copy className="w-4 h-4 text-[var(--text-muted)]" />
        </button>

        {session.status === "waiting" && (
          <>
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mt-1">
              <Users2 className="w-3.5 h-3.5" /> {session.participants.length} kishi qo&apos;shildi
            </div>
            <Button className="w-full mt-3" leftIcon={<Play className="w-4 h-4" />} onClick={() => runAction("start")} isLoading={busy} disabled={session.participants.length === 0}>
              Testni boshlash
            </Button>
            {session.participants.length === 0 && (
              <p className="text-xs text-[var(--text-muted)] mt-1">Boshlash uchun kamida bitta o&apos;quvchi qo&apos;shilishi kerak</p>
            )}
          </>
        )}

        {session.status === "active" && (
          <>
            <div className="flex items-center gap-1.5 text-sm font-medium mt-1" style={{ color: remaining < 30 ? "var(--danger-text)" : "var(--text-primary)" }}>
              <Clock className="w-4 h-4" /> {formatTime(remaining)}
            </div>
            <p className="text-xs text-[var(--text-muted)]">{submittedCount}/{session.participants.length} topshirdi</p>
            <Button variant="danger" className="w-full mt-3" leftIcon={<Square className="w-4 h-4" />} onClick={() => runAction("finish")} isLoading={busy}>
              Yakunlash
            </Button>
          </>
        )}

        {session.status === "finished" && (
          <div className="flex items-center gap-1.5 text-xs mt-1" style={{ color: "var(--success-text)" }}>
            <CheckCircle2 className="w-3.5 h-3.5" /> Test yakunlandi
          </div>
        )}
      </Card>

      <div>
        <h2 className="text-xs font-medium text-[var(--text-muted)] mb-2">Natijalar</h2>
        {sorted.length === 0 ? (
          <Card><p className="text-sm text-[var(--text-muted)] text-center">Hali hech kim qo&apos;shilmadi</p></Card>
        ) : (
          <div className="rounded-[var(--radius-card)] bg-[var(--card-bg)] border-[0.5px] border-[var(--card-border)] divide-y divide-[var(--card-border)] overflow-hidden">
            {sorted.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 p-3.5">
                <span className="w-5 text-xs text-[var(--text-muted)] shrink-0">{i + 1}</span>
                <span className="flex-1 text-sm font-medium text-[var(--text-primary)] truncate">{p.name}</span>
                {p.submittedAt ? (
                  <span className="text-sm font-medium" style={{ color: "var(--accent-primary-hover)" }}>
                    {p.score}% <span className="text-xs text-[var(--text-muted)] font-normal">({p.correctCount}/{session.questionCount})</span>
                  </span>
                ) : (
                  <span className="text-xs text-[var(--text-muted)]">
                    {session.status === "waiting" ? "kutmoqda" : "ishlamoqda..."}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
