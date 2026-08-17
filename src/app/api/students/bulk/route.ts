import { NextResponse } from 'next/server';
import { db } from '@/utils/db';

interface BulkStudentInput {
  firstName?: string;
  lastName?: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { classId, students } = body;

    if (!classId || !Array.isArray(students) || students.length === 0) {
      return NextResponse.json({ error: "Sinf va o'quvchilar ro'yxati kiritilishi shart" }, { status: 400 });
    }

    const valid = (students as BulkStudentInput[]).filter(
      (s) => s.firstName?.trim() && s.lastName?.trim()
    );

    if (valid.length === 0) {
      return NextResponse.json({ error: "Yaroqli o'quvchi topilmadi" }, { status: 400 });
    }

    const created = await db.$transaction(
      valid.map((s) =>
        db.student.create({
          data: { firstName: s.firstName!.trim(), lastName: s.lastName!.trim(), classId },
        })
      )
    );

    return NextResponse.json({ success: true, count: created.length, students: created }, { status: 201 });
  } catch (error) {
    console.error("POST /api/students/bulk error:", error);
    return NextResponse.json({ error: "O'quvchilarni saqlashda xatolik yuz berdi" }, { status: 500 });
  }
}
