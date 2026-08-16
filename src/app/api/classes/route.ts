import { NextResponse } from 'next/server';
import { db } from '@/utils/db';

export async function GET() {
  try {
    const classes = await db.class.findMany({
      include: {
        _count: {
          select: { students: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(classes);
  } catch (error) {
    console.error("GET /api/classes error:", error);
    return NextResponse.json({ error: "Sinflarni yuklashda xatolik yuz berdi" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, academicYear, description } = body;
    
    if (!name) {
      return NextResponse.json({ error: "Sinf nomi kiritilishi shart" }, { status: 400 });
    }
    
    const newClass = await db.class.create({
      data: {
        name,
        academicYear: academicYear || null,
        description: description || null
      }
    });
    
    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    console.error("POST /api/classes error:", error);
    return NextResponse.json({ error: "Sinf qo'shishda xatolik yuz berdi" }, { status: 500 });
  }
}
