import { useState } from "react";
import { BrainCircuit, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface AiFocusStudent {
  name: string;
  reason: string;
  recommendation: string;
}

interface AiAnalysisResult {
  methodology: string;
  students: AiFocusStudent[];
}

interface AiAnalysisSectionProps {
  testId: string;
}

type Status = "idle" | "loading" | "success" | "error";

export function AiAnalysisSection({ testId }: AiAnalysisSectionProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<AiAnalysisResult | null>(null);

  const runAnalysis = async () => {
    setStatus("loading");
    try {
      const res = await fetch("/api/report/ai-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testId }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResult(data);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <Card className="p-5 bg-gradient-to-br from-indigo-600 to-violet-700 text-white border-none shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <BrainCircuit className="w-6 h-6 text-indigo-200" />
        <h3 className="font-bold text-lg">AI Tahlili</h3>
      </div>

      {status === "idle" && (
        <div className="space-y-4">
          <p className="text-sm text-indigo-100 leading-relaxed">
            AI natijalarni tahlil qilib, metodika bo&apos;yicha xulosa va e&apos;tibor talab qiladigan o&apos;quvchilar ro&apos;yxatini tayyorlaydi.
          </p>
          <Button
            onClick={runAnalysis}
            leftIcon={<Sparkles className="w-4 h-4" />}
            className="bg-white/15 hover:bg-white/25 text-white border border-white/20 py-2.5 px-4 text-sm w-full sm:w-auto"
          >
            Tahlil qilish
          </Button>
        </div>
      )}

      {status === "loading" && (
        <div className="flex items-center gap-3 py-4 text-sm text-indigo-100">
          <Loader2 className="w-5 h-5 animate-spin shrink-0" />
          <span className="animate-pulse">AI tahlil qilyapti...</span>
        </div>
      )}

      {status === "error" && (
        <div className="space-y-3">
          <p className="text-sm text-indigo-100">Tahlil qilib bo&apos;lmadi, qayta urinib ko&apos;ring.</p>
          <Button
            onClick={runAnalysis}
            leftIcon={<RotateCcw className="w-4 h-4" />}
            className="bg-white/15 hover:bg-white/25 text-white border border-white/20 py-2.5 px-4 text-sm w-full sm:w-auto"
          >
            Qayta urinish
          </Button>
        </div>
      )}

      {status === "success" && result && (
        <div className="space-y-4 text-sm text-indigo-50 leading-relaxed">
          <p>{result.methodology}</p>

          {result.students.length > 0 && (
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm space-y-2">
              <h4 className="font-semibold text-white mb-1">E&apos;tibor kerak o&apos;quvchilar</h4>
              {result.students.map((student, i) => (
                <div key={i} className="p-2.5 bg-white/10 rounded-lg">
                  <p className="font-semibold text-white text-sm">{student.name}</p>
                  <p className="text-indigo-100 text-xs mt-0.5">{student.reason}</p>
                  <p className="text-indigo-200 text-xs mt-1 italic">{student.recommendation}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
