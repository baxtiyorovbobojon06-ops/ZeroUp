import { NextResponse } from "next/server";
import { db } from "@/utils/db";

export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;

    const session = await db.liveSession.findUnique({
      where: { code },
      include: {
        participants: {
          orderBy: { joinedAt: "asc" },
          select: {
            id: true,
            name: true,
            joinedAt: true,
            submittedAt: true,
            score: true,
            correctCount: true,
          },
        },
        _count: { select: { questions: true } },
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Bunday kodli test topilmadi" }, { status: 404 });
    }

    return NextResponse.json({
      id: session.id,
      code: session.code,
      subject: session.subject,
      topic: session.topic,
      grade: session.grade,
      difficulty: session.difficulty,
      durationSec: session.durationSec,
      status: session.status,
      startedAt: session.startedAt,
      endsAt: session.endsAt,
      questionCount: session._count.questions,
      participants: session.participants,
    });
  } catch (error) {
    console.error("GET /api/sessions/[code] error:", error);
    return NextResponse.json({ error: "Testni yuklashda xatolik yuz berdi" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;
    const { action } = await req.json();

    const session = await db.liveSession.findUnique({ where: { code } });
    if (!session) {
      return NextResponse.json({ error: "Bunday kodli test topilmadi" }, { status: 404 });
    }

    if (action === "start") {
      if (session.status !== "waiting") {
        return NextResponse.json({ error: "Test allaqachon boshlangan" }, { status: 409 });
      }
      const startedAt = new Date();
      const endsAt = new Date(startedAt.getTime() + session.durationSec * 1000);
      const updated = await db.liveSession.update({
        where: { code },
        data: { status: "active", startedAt, endsAt },
      });
      return NextResponse.json(updated);
    }

    if (action === "finish") {
      const updated = await db.liveSession.update({
        where: { code },
        data: { status: "finished" },
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Noma'lum amal" }, { status: 400 });
  } catch (error) {
    console.error("PATCH /api/sessions/[code] error:", error);
    return NextResponse.json({ error: "Amalni bajarishda xatolik yuz berdi" }, { status: 500 });
  }
}
