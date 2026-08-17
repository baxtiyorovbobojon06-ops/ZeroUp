import { NextResponse } from 'next/server';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject, type UserContent } from 'ai';
import { z } from 'zod';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

export const maxDuration = 60;

const schema = z.object({
  students: z.array(
    z.object({
      firstName: z.string().describe("O'quvchining ismi"),
      lastName: z.string().describe("O'quvchining familiyasi"),
    })
  ),
});

export async function POST(request: Request) {
  try {
    const { images } = await request.json();

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: "Kamida bitta rasm yuklang" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "API kalit o'rnatilmagan" }, { status: 500 });
    }

    const promptText = `
Sen sinf jurnali yoki o'quvchilar ro'yxati rasmidan ism-familiyalarni aniqlaydigan yordamchisan.
Rasm(lar)da ko'rsatilgan har bir o'quvchining ismi va familiyasini alohida ustunlarga ajratib chiqar.
Agar bitta qatorda faqat bitta so'z yozilgan bo'lsa (familiyasiz), uni ism sifatida qabul qil va
familiyani "Aniqlanmagan" deb belgila. Ro'yxatga aloqasi bo'lmagan matnlarni (sarlavha, sana,
sinf nomi va h.k.) o'tkazib yubor. Har bir o'quvchini faqat bir marta qaytar.

Diqqat: Natijani faqat so'ralgan JSON formatida qaytar!
    `;

    const messageContent: UserContent = [{ type: 'text', text: promptText }];
    for (const img of images) {
      messageContent.push({ type: 'image', image: img.data });
    }

    const { object } = await generateObject({
      model: google('gemini-3.5-flash'),
      schema,
      messages: [{ role: 'user', content: messageContent }],
    });

    return NextResponse.json(object);

  } catch (error) {
    console.error("POST /api/students/extract-from-image error:", error);
    const details = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Rasmdan ismlarni aniqlashda xatolik yuz berdi", details }, { status: 500 });
  }
}
