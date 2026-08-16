import { NextResponse } from 'next/server';
import { db } from '@/utils/db';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: "Test ID si topilmadi" }, { status: 400 });
    }
    
    const test = await db.test.findUnique({
      where: { id },
      include: {
        class: true,
        variants: true
      }
    });
    
    if (!test) {
      return NextResponse.json({ error: "Test topilmadi" }, { status: 404 });
    }
    
    return NextResponse.json(test);
  } catch (error) {
    console.error("GET /api/tests/[id] error:", error);
    return NextResponse.json({ error: "Testni yuklashda xatolik yuz berdi" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: "Test ID si topilmadi" }, { status: 400 });
    }
    
    await db.test.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/tests/[id] error:", error);
    return NextResponse.json({ error: "Testni o'chirishda xatolik yuz berdi" }, { status: 500 });
  }
}
