import { NextResponse } from "next/server";
import { db } from "@/utils/db";
import { shuffle } from "@/lib/server/liveSession";

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;
    const { name } = await req.json();

    const trimmedName = (name || "").trim();
    if (!trimmedName) {
      return NextResponse.json({ error: "Ismingizni kiriting" }, { status: 400 });
    }

    const session = await db.liveSession.findUnique({
      where: { code },
      include: { questions: { select: { id: true } } },
    });

    if (!session) {
      return NextResponse.json({ error: "Bunday kodli test topilmadi" }, { status: 404 });
    }
    if (session.status !== "waiting") {
      return NextResponse.json({ error: "Test allaqachon boshlangan, qo'shilib bo'lmaydi" }, { status: 409 });
    }

    const existing = await db.liveParticipant.findFirst({
      where: { sessionId: session.id, name: { equals: trimmedName, mode: "insensitive" } },
    });
    if (existing) {
      return NextResponse.json({ error: "Bu ism band, boshqa ism kiriting" }, { status: 409 });
    }

    const questionOrder = shuffle(session.questions.map((q) => q.id));

    const participant = await db.liveParticipant.create({
      data: {
        sessionId: session.id,
        name: trimmedName,
        questionOrder: JSON.stringify(questionOrder),
      },
    });

    return NextResponse.json({ participantId: participant.id }, { status: 201 });
  } catch (error) {
    console.error("POST /api/sessions/[code]/join error:", error);
    return NextResponse.json({ error: "Qo'shilishda xatolik yuz berdi" }, { status: 500 });
  }
}
