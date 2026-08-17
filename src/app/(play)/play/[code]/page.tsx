"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Users2, Clock, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface SessionInfo {
  subject: string;
  topic: string;
  status: "waiting" | "active" | "finished";
  participants: { id: string }[];
  questionCount: number;
}

interface LiveQuestion {
  id: string;
  question: string;
  options: string[];
}

interface Result {
  score: number;
  correctCount: number;
  totalQuestions: number;
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function PlaySessionPage() {
  const { code } = useParams<{ code: string }>();
  const searchParams = useSearchParams();
  const participantId = searchParams.get("pid") || (typeof window !== "undefined" ? localStorage.getItem(`live_pid_${code}`) : null);

  const [session, setSession] = useState<SessionInfo | null>(null);
  const [questions, setQuestions] = useState<LiveQuestion[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [endsAt, setEndsAt] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number>(0);
  const [result, setResult] = useState<Result | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submittedRef = useRef(false);

  const submit = useCallback(async (currentAnswers: Record<string, string>) => {
    if (submittedRef.current || !participantId) return;
    submittedRef.current = true;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/sessions/${code}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId,
          answers: Object.entries(currentAnswers).map(([questionId, selectedAnswer]) => ({ questionId, selectedAnswer })),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        toast.error(data.error || "Topshirishda xatolik yuz berdi");
        submittedRef.current = false;
      }
    } catch {
      toast.error("Tarmoq xatoligi");
      submittedRef.current = false;
    } finally {
      setSubmitting(false);
    }
  }, [code, participantId]);

  // Poll session status
  useEffect(() => {
    if (!code) return;
    const load = async () => {
      const res = await fetch(`/api/sessions/${code}`);
      if (res.ok) setSession(await res.json());
    };
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [code]);

  // Fetch questions once active
  useEffect(() => {
    if (!participantId || session?.status !== "active" || result) return;

    const load = async () => {
      const res = await fetch(`/api/sessions/${code}/questions?participantId=${participantId}`);
      const data = await res.json();
      if (!res.ok) return;
      if (data.submitted) {
        setResult({ score: data.score, correctCount: data.correctCount, totalQuestions: data.questionCount });
        return;
      }
      setQuestions(data.questions);
      setEndsAt(data.endsAt);
    };
    load();
  }, [code, participantId, session?.status, result]);

  // Countdown timer
  useEffect(() => {
    if (!endsAt || result) return;
    const tick = () => {
      const diff = Math.max(0, Math.floor((new Date(endsAt).getTime() - Date.now()) / 1000));
      setRemaining(diff);
      if (diff <= 0) {
        submit(answers);
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endsAt, result]);

  if (!participantId) {
    return (
      <Card>
        <p className="text-sm text-[var(--text-secondary)]">
          Ishtirokchi topilmadi. Iltimos, <a href="/join" className="text-[var(--accent-primary)] underline">qo&apos;shilish</a> sahifasidan qayta kiring.
        </p>
      </Card>
    );
  }

  if (result) {
    return (
      <Card className="flex flex-col items-center gap-3 text-center py-8">
        <CheckCircle2 className="w-10 h-10" style={{ color: "var(--success-text)" }} />
        <h1 className="text-lg font-medium text-[var(--text-primary)]">Test topshirildi!</h1>
        <p className="text-3xl font-medium" style={{ color: "var(--accent-primary-hover)" }}>{result.score}%</p>
        <p className="text-xs text-[var(--text-muted)]">
          {result.correctCount} / {result.totalQuestions} savolga to&apos;g&apos;ri javob berdingiz
        </p>
      </Card>
    );
  }

  if (!session) {
    return <Card><p className="text-sm text-[var(--text-muted)]">Yuklanmoqda...</p></Card>;
  }

  if (session.status === "waiting") {
    return (
      <Card className="flex flex-col items-center gap-3 text-center py-8">
        <div className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--accent-primary)", borderTopColor: "transparent" }} />
        <h1 className="text-base font-medium text-[var(--text-primary)]">{session.subject} — {session.topic}</h1>
        <p className="text-xs text-[var(--text-muted)]">O&apos;qituvchi testni boshlashini kuting...</p>
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
          <Users2 className="w-3.5 h-3.5" /> {session.participants.length} kishi qo&apos;shildi
        </div>
      </Card>
    );
  }

  if (session.status === "finished" && !questions) {
    return (
      <Card>
        <p className="text-sm text-[var(--text-secondary)]">Test yakunlandi.</p>
      </Card>
    );
  }

  if (!questions) {
    return <Card><p className="text-sm text-[var(--text-muted)]">Savollar yuklanmoqda...</p></Card>;
  }

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="flex flex-col gap-4">
      <div
        className="sticky top-0 z-10 flex items-center justify-between rounded-[var(--radius-card)] px-4 py-2.5 bg-[var(--card-bg)] border-[0.5px] border-[var(--card-border)]"
      >
        <span className="text-xs text-[var(--text-muted)]">{answeredCount}/{questions.length} javob berildi</span>
        <div className="flex items-center gap-1.5 text-sm font-medium" style={{ color: remaining < 30 ? "var(--danger-text)" : "var(--text-primary)" }}>
          <Clock className="w-4 h-4" /> {formatTime(remaining)}
        </div>
      </div>

      {questions.map((q, idx) => (
        <Card key={q.id} className="flex flex-col gap-3">
          <p className="text-sm font-medium text-[var(--text-primary)]">{idx + 1}. {q.question}</p>
          <div className="flex flex-col gap-2">
            {q.options.map((opt) => (
              <label
                key={opt}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-[var(--radius)] border cursor-pointer text-sm"
                style={{
                  borderColor: answers[q.id] === opt ? "var(--accent-primary)" : "var(--card-border)",
                  background: answers[q.id] === opt ? "var(--accent-bg-tint)" : "transparent",
                  color: "var(--text-primary)",
                }}
              >
                <input
                  type="radio"
                  name={q.id}
                  className="accent-[var(--accent-primary)]"
                  checked={answers[q.id] === opt}
                  onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                />
                {opt}
              </label>
            ))}
          </div>
        </Card>
      ))}

      <Button className="w-full" onClick={() => submit(answers)} isLoading={submitting}>
        Topshirish
      </Button>
    </div>
  );
}
