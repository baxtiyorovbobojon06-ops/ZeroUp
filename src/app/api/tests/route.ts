import { NextResponse } from 'next/server';
import { db } from '@/utils/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');
    
    let whereClause = {};
    if (classId) {
      whereClause = { classId };
    }
    
    const tests = await db.test.findMany({
      where: whereClause,
      include: {
        class: true,
        _count: {
          select: { attempts: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(tests);
  } catch (error) {
    console.error("GET /api/tests error:", error);
    return NextResponse.json({ error: "Testlarni yuklashda xatolik yuz berdi" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { classId, subject, title, questionCount, date, answerKey } = body;
    
    if (!classId || !subject || !title || !questionCount || !answerKey) {
      return NextResponse.json({ error: "Barcha maydonlarni to'ldirish shart" }, { status: 400 });
    }
    
    const newTest = await db.test.create({
      data: {
        classId,
        subject,
        title,
        questionCount: parseInt(questionCount),
        date: date ? new Date(date) : new Date(),
        answerKey
      }
    });
    
    return NextResponse.json(newTest, { status: 201 });
  } catch (error) {
    console.error("POST /api/tests error:", error);
    return NextResponse.json({ error: "Test qo'shishda xatolik yuz berdi" }, { status: 500 });
  }
}
