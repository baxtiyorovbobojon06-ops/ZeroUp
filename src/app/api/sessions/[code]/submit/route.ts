import { NextResponse } from "next/server";
import { db } from "@/utils/db";

interface SubmittedAnswer {
  questionId: string;
  selectedAnswer: string | null;
}

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;
    const { participantId, answers } = await req.json();

    if (!participantId || !Array.isArray(answers)) {
      return NextResponse.json({ error: "Ma'lumotlar to'liq emas" }, { status: 400 });
    }

    const session = await db.liveSession.findUnique({
      where: { code },
      include: { questions: true },
    });
    if (!session) {
      return NextResponse.json({ error: "Bunday kodli test topilmadi" }, { status: 404 });
    }

    const participant = await db.liveParticipant.findUnique({ where: { id: participantId } });
    if (!participant || participant.sessionId !== session.id) {
      return NextResponse.json({ error: "Ishtirokchi topilmadi" }, { status: 404 });
    }
    if (participant.submittedAt) {
      return NextResponse.json({ error: "Siz allaqachon topshirgansiz" }, { status: 409 });
    }

    const questionsById = new Map(session.questions.map((q) => [q.id, q]));

    let correctCount = 0;
    const answerRows = (answers as SubmittedAnswer[])
      .filter((a) => questionsById.has(a.questionId))
      .map((a) => {
        const q = questionsById.get(a.questionId)!;
        const isCorrect = !!a.selectedAnswer && a.selectedAnswer === q.correctAnswer;
        if (isCorrect) correctCount++;
        return {
          questionId: a.questionId,
          selectedAnswer: a.selectedAnswer,
          isCorrect,
        };
      });

    const totalQuestions = session.questions.length || 1;
    const score = Math.round((correctCount / totalQuestions) * 100);

    await db.$transaction([
      db.liveAnswer.createMany({
        data: answerRows.map((a) => ({ participantId, ...a })),
      }),
      db.liveParticipant.update({
        where: { id: participantId },
        data: { submittedAt: new Date(), score, correctCount },
      }),
    ]);

    return NextResponse.json({ score, correctCount, totalQuestions });
  } catch (error) {
    console.error("POST /api/sessions/[code]/submit error:", error);
    return NextResponse.json({ error: "Javoblarni saqlashda xatolik yuz berdi" }, { status: 500 });
  }
}
