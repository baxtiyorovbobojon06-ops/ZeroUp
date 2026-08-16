import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { generateTestQuestions } from '@/lib/server/aiGenerator';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fan, sinf, mavzu, savollarSoni, qiyinlik } = body;

    if (!fan || !sinf || !mavzu || !savollarSoni) {
      return NextResponse.json({ error: "Barcha maydonlarni to'ldirish shart" }, { status: 400 });
    }

    const count = parseInt(savollarSoni, 10);
    if (!count || count < 1) {
      return NextResponse.json({ error: "Savollar soni noto'g'ri" }, { status: 400 });
    }

    const questions = await generateTestQuestions({
      fan,
      sinf,
      mavzu,
      savollarSoni: count,
      qiyinlik: qiyinlik || "O'rta",
    });

    if (questions.length === 0) {
      return NextResponse.json({ error: "AI savol generatsiya qila olmadi" }, { status: 502 });
    }

    const answerKey = JSON.stringify({
      grade: sinf,
      difficulty: qiyinlik || "O'rta",
      questions,
    });

    const newTest = await db.test.create({
      data: {
        subject: fan,
        title: mavzu,
        questionCount: questions.length,
        answerKey,
      },
      include: {
        class: true,
        _count: { select: { attempts: true } },
      },
    });

    return NextResponse.json(newTest, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/tests/generate error:", error);
    return NextResponse.json(
      { error: "Test generatsiya qilishda xatolik yuz berdi", details: error.message },
      { status: 500 }
    );
  }
}
