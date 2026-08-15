import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function POST(request: Request) {
  try {
    const { grade, subject, topic, info } = await request.json();

    if (!grade || !subject || !topic || !info) {
      return NextResponse.json({ error: "Barcha maydonlarni to'ldiring" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return NextResponse.json({
        attendance: "26 o'quvchidan 24 nafari qatnashdi.",
        performance: "18 nafar o'quvchi mavzuni yaxshi o'zlashtirdi.",
        issues: "6 nafar o'quvchiga qo'shimcha tushuntirish kerak.",
        recommendations: "Keyingi darsda qo'shimcha mashqlar o'tkazish tavsiya etiladi.",
        conclusion: "Dars maqsadi asosan bajarildi."
      });
    }

    const prompt = `
      Sen professional maktab o'qituvchisisan. Quyidagi ma'lumotlar asosida dars hisobotini tayyorla.
      
      Sinf: ${grade}
      Fan: ${subject}
      Mavzu: ${topic}
      Dars ma'lumoti: ${info}

      Javobni strukturaviy JSON formatida qaytar:
      {
        "attendance": "Davomat xulosasi",
        "performance": "O'zlashtirish xulosasi",
        "issues": "Muammolar",
        "recommendations": "Keyingi dars uchun tavsiyalar",
        "conclusion": "Umumiy xulosa"
      }
    `;

    const response = await genAI.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const content = response.text;
    if (!content) throw new Error("No content");

    return NextResponse.json(JSON.parse(content));

  } catch (error: any) {
    console.error("Report API error:", error);
    return NextResponse.json({ error: "Hisobot yaratishda xatolik yuz berdi.", details: error.message }, { status: 500 });
  }
}
