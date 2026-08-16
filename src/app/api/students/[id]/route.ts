import { NextResponse } from 'next/server';
import { db } from '@/utils/db';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: "O'quvchi ID si topilmadi" }, { status: 400 });
    }
    
    await db.student.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/students/[id] error:", error);
    return NextResponse.json({ error: "O'quvchini o'chirishda xatolik yuz berdi" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { firstName, lastName } = body;
    
    if (!id || !firstName || !lastName) {
      return NextResponse.json({ error: "Ma'lumotlar to'liq emas" }, { status: 400 });
    }
    
    const updatedStudent = await db.student.update({
      where: { id },
      data: { firstName, lastName }
    });
    
    return NextResponse.json(updatedStudent);
  } catch (error) {
    console.error("PUT /api/students/[id] error:", error);
    return NextResponse.json({ error: "O'quvchini tahrirlashda xatolik yuz berdi" }, { status: 500 });
  }
}
