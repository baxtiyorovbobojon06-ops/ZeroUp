import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function POST(request: Request) {
  try {
    const { assignment, student_answer } = await request.json();

    if (!assignment || !student_answer) {
      return NextResponse.json({ error: "Barcha maydonlarni to'ldiring" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return NextResponse.json({
        score: "100/100",
        status: "To'g'ri",
        correct_parts: ["Tenglama ildizlarini to'g'ri topgan"],
        mistakes: [],
        feedback: "O'quvchi tenglamani to'g'ri yechgan.",
        recommendation: "Keyingi bosqichda murakkabroq tenglamalarni ishlash tavsiya etiladi."
      });
    }

    const prompt = `
      Sen tajribali maktab o'qituvchisisan.
      O'quvchining quyidagi topshiriqqa bergan javobini tekshir va baho ber.

      Topshiriq:
      ${assignment}

      O'quvchi javobi:
      ${student_answer}

      Javob faqat JSON formatida bo'lsin:
      {
        "score": "Baho (masalan: 100/100, 80/100)",
        "status": "To'g'ri, Qisman to'g'ri, yoki Xato",
        "correct_parts": ["To'g'ri bajarilgan joyi"],
        "mistakes": ["Xato qilingan joyi"],
        "feedback": "Umumiy xulosa va tushuntirish",
        "recommendation": "Keyingi qadam uchun tavsiya"
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
    console.error("Grader API error:", error);
    return NextResponse.json({ error: "Javobni tekshirishda xatolik yuz berdi.", details: error.message }, { status: 500 });
  }
}
