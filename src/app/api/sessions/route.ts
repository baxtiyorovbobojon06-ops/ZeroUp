import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { db } from "@/utils/db";
import { createUniqueSessionCode } from "@/lib/server/liveSession";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface GeneratedQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
}

async function generateQuestions(
  grade: string | undefined,
  subject: string,
  topic: string,
  questionsCount: number,
  difficulty: string | undefined
): Promise<GeneratedQuestion[]> {
  if (!process.env.GEMINI_API_KEY) {
    return Array.from({ length: questionsCount }, (_, i) => ({
      question: `${topic} bo'yicha ${i + 1}-savol (test rejimi, API key sozlanmagan)`,
      options: ["Variant A", "Variant B", "Variant C", "Variant D"],
      correct_answer: "Variant A",
      explanation: "Bu namunaviy savol.",
    }));
  }

  const prompt = `
    Sen O'zbekiston ta'lim standartlariga mos test tuzuvchi sun'iy intellekt, ya'ni AI Agentisan. Quyidagi shartlar asosida test savollarini tuzib ber:

    Fan: ${subject}
    Sinf: ${grade || "Ko'rsatilmagan"}
    Mavzu: ${topic}
    Savollar soni: ${questionsCount} ta
    Qiyinlik darajasi: ${difficulty || "O'rta"}

    Har bir savol 4 ta variantli bo'lsin va oxirida to'g'ri javoblari hamda qisqacha izohi ko'rsatilsin.
    Matematik ifodalarni LaTeX belgilarisiz (masalan \\frac, $ ishlatmasdan), oddiy matn shaklida yozing. Masalan kasrni "3/4" tarzida yozing.

    MUHIM: Dastur ishlashi uchun javobing faqat va faqat quyidagi JSON formatida bo'lishi shart. Strukturasi:
    {
      "questions": [
        {
          "question": "Savol matni",
          "options": ["A variant", "B variant", "C variant", "D variant"],
          "correct_answer": "To'g'ri variant matni",
          "explanation": "Qisqa izoh"
        }
      ]
    }
  `;

  const response = await genAI.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: prompt,
    config: { responseMimeType: "application/json" },
  });

  const content = response.text;
  if (!content) throw new Error("AI javob bermadi");

  const parsed = JSON.parse(content);
  return parsed.questions || [];
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { subject, topic, grade, questionCount, difficulty, durationSec } = body;

    if (!subject || !topic || !questionCount) {
      return NextResponse.json({ error: "Fan, mavzu va savollar sonini kiriting" }, { status: 400 });
    }

    const count = Math.min(Math.max(parseInt(questionCount), 1), 30);
    const questions = await generateQuestions(grade, subject, topic, count, difficulty);

    if (!questions.length) {
      return NextResponse.json({ error: "Savollar yaratilmadi, qaytadan urinib ko'ring" }, { status: 502 });
    }

    const code = await createUniqueSessionCode();

    const session = await db.liveSession.create({
      data: {
        code,
        subject,
        topic,
        grade: grade || null,
        difficulty: difficulty || null,
        durationSec: durationSec ? Math.min(Math.max(parseInt(durationSec), 30), 3600) : 300,
        questions: {
          create: questions.map((q, i) => ({
            order: i,
            question: q.question,
            options: JSON.stringify(q.options || []),
            correctAnswer: q.correct_answer,
            explanation: q.explanation || null,
          })),
        },
      },
    });

    return NextResponse.json({ id: session.id, code: session.code }, { status: 201 });
  } catch (error) {
    console.error("POST /api/sessions error:", error);
    const details = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Jonli test yaratishda xatolik yuz berdi", details }, { status: 500 });
  }
}
