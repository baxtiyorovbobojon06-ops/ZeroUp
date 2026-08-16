import { NextResponse } from 'next/server';
import { db } from '@/utils/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');
    
    if (!classId) {
      return NextResponse.json({ error: "classId talab qilinadi" }, { status: 400 });
    }
    
    const students = await db.student.findMany({
      where: { classId },
      orderBy: { firstName: 'asc' }
    });
    
    return NextResponse.json(students);
  } catch (error) {
    console.error("GET /api/students error:", error);
    return NextResponse.json({ error: "O'quvchilarni yuklashda xatolik yuz berdi" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, classId } = body;
    
    if (!firstName || !lastName || !classId) {
      return NextResponse.json({ error: "Ism, familiya va sinf kiritilishi shart" }, { status: 400 });
    }
    
    const newStudent = await db.student.create({
      data: {
        firstName,
        lastName,
        classId
      }
    });
    
    return NextResponse.json(newStudent, { status: 201 });
  } catch (error) {
    console.error("POST /api/students error:", error);
    return NextResponse.json({ error: "O'quvchi qo'shishda xatolik yuz berdi" }, { status: 500 });
  }
}
