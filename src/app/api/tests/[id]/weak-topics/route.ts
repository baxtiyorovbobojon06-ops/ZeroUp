import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { db } from '@/utils/db';
import type { WeakTopicRecommendation } from '@/lib/types/classResults';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface AnswerKeyQuestion {
  question?: string;
}

function parseQuestionTexts(answerKey: string): Map<number, string> {
  const map = new Map<number, string>();
  try {
    const parsed = JSON.parse(answerKey);
    if (Array.isArray(parsed?.questions)) {
      (parsed.questions as AnswerKeyQuestion[]).forEach((q, i) => {
        if (q?.question) map.set(i + 1, q.question);
      });
    }
  } catch {
    // Plain-text answer key — no per-question text available, that's fine.
  }
  return map;
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');

    if (!id || !studentId) {
      return NextResponse.json({ error: "Test yoki o'quvchi ID si topilmadi" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "AI tahlil sozlanmagan (GEMINI_API_KEY yo'q)" }, { status: 502 });
    }

    const [test, attempt, student] = await Promise.all([
      db.test.findUnique({ where: { id } }),
      db.testAttempt.findFirst({
        where: { testId: id, studentId },
        include: { answers: { where: { isCorrect: false }, orderBy: { questionNumber: 'asc' } } },
      }),
      db.student.findUnique({ where: { id: studentId } }),
    ]);

    if (!test || !attempt || !student) {
      return NextResponse.json({ error: "Ma'lumot topilmadi" }, { status: 404 });
    }

    if (attempt.answers.length === 0) {
      return NextResponse.json({ mavzular: [], tavsiya: "Xato javoblar topilmadi." });
    }

    const questionTexts = parseQuestionTexts(test.answerKey);
    const xatoSavollar = attempt.answers.map((a) => ({
      savolRaqami: a.questionNumber,
      savolMatni: questionTexts.get(a.questionNumber) || null,
      oquvchiJavobi: a.studentAnswer,
      togriJavob: a.correctAnswer,
    }));

    const prompt = `
      Sen fan o'qituvchisan. O'quvchi "${student.firstName} ${student.lastName}" "${test.subject}"
      fanidan "${test.title}" mavzusidagi testda quyidagi savollarda xato qilgan. Xato javoblar
      asosida qaysi mavzu(lar)ni takrorlashi kerakligini va qisqa amaliy tavsiyani aniqla.

      Xato savollar: ${JSON.stringify(xatoSavollar)}

      MUHIM: Javobni aynan quyidagi JSON formatida, o'zbek tilida qaytar:
      {
        "mavzular": ["mavzu 1", "mavzu 2"],
        "tavsiya": "1-2 gapdan iborat qisqa amaliy tavsiya"
      }
    `;

    const response = await genAI.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const content = response.text;
    if (!content) throw new Error("No content");

    let parsed: WeakTopicRecommendation;
    try {
      parsed = JSON.parse(content);
    } catch {
      console.error("weak-topics JSON parse error. Raw content:", content);
      return NextResponse.json({ error: "AI javobini qayta ishlab bo'lmadi" }, { status: 502 });
    }

    return NextResponse.json(parsed);

  } catch (error) {
    console.error("GET /api/tests/[id]/weak-topics error:", error);
    const details = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "AI tahlilida xatolik yuz berdi", details }, { status: 502 });
  }
}
