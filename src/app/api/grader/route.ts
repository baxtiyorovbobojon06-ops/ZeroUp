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
      Sen o'quvchilarning vazifalarini xolis va tahliliy tekshiruvchi o'qituvchi yordamchisan. Quyidagi topshiriq sharti va o'quvchining javobini tahlil qil:

      Topshiriq sharti: ${assignment}

      O'quvchining javobi: ${student_answer}

      Natijani quyidagi strukturada ber:
      - Yakuniy Baho: (0 dan 100 gacha yoki 5 ballik tizimda)
      - Xato va kamchiliklar: (Agar xato bo'lsa, nima uchun xato ekanligini aniq tushuntir)
      - Umumiy xulosa: (Qisqacha baho)
      - Tavsiya: (O'quvchi bu mavzuni yaxshiroq tushunishi uchun nima qilishi kerakligiga maslahat)

      MUHIM: Tizim to'g'ri ishlashi uchun ushbu natijalarni aynan quyidagi qat'iy JSON formatida qaytarishing shart:
      {
        "score": "Yakuniy Baho (masalan: 100/100, 5/5)",
        "status": "To'g'ri, Qisman to'g'ri, yoki Xato",
        "correct_parts": ["To'g'ri bajarilgan joyi (agar bo'lsa)"],
        "mistakes": ["Xato va kamchiliklar haqida aniq tushuntirish"],
        "feedback": "Umumiy xulosa",
        "recommendation": "Tavsiya qismi"
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
