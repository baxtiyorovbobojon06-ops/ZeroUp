import { NextResponse } from 'next/server';
import { db } from '@/utils/db';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: "Sinf ID si topilmadi" }, { status: 400 });
    }
    
    await db.class.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/classes/[id] error:", error);
    return NextResponse.json({ error: "Sinfni o'chirishda xatolik yuz berdi" }, { status: 500 });
  }
}
