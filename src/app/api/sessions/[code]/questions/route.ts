import { NextResponse } from "next/server";
import { db } from "@/utils/db";
import { seededShuffle } from "@/lib/server/liveSession";

export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;
    const { searchParams } = new URL(req.url);
    const participantId = searchParams.get("participantId");

    if (!participantId) {
      return NextResponse.json({ error: "participantId talab qilinadi" }, { status: 400 });
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

    if (session.status === "waiting") {
      return NextResponse.json({ error: "Test hali boshlanmagan" }, { status: 425 });
    }

    if (participant.submittedAt) {
      return NextResponse.json({
        submitted: true,
        score: participant.score,
        correctCount: participant.correctCount,
        questionCount: session.questions.length,
      });
    }

    const questionOrder: string[] = JSON.parse(participant.questionOrder);
    const questionsById = new Map(session.questions.map((q) => [q.id, q]));

    const orderedQuestions = questionOrder
      .map((id) => questionsById.get(id))
      .filter((q): q is NonNullable<typeof q> => Boolean(q));

    const questions = orderedQuestions.map((q) => ({
      id: q.id,
      question: q.question,
      options: seededShuffle(JSON.parse(q.options) as string[], participant.id + q.id),
    }));

    return NextResponse.json({
      submitted: false,
      status: session.status,
      endsAt: session.endsAt,
      questions,
    });
  } catch (error) {
    console.error("GET /api/sessions/[code]/questions error:", error);
    return NextResponse.json({ error: "Savollarni yuklashda xatolik yuz berdi" }, { status: 500 });
  }
}
