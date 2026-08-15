import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function POST(request: Request) {
  try {
    const { grade, subject, topic, questionsCount, difficulty } = await request.json();

    if (!grade || !subject || !topic || !questionsCount) {
      return NextResponse.json({ error: "Barcha maydonlarni to'ldiring" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return NextResponse.json({
        questions: [
          {
            question: "Yurakning asosiy vazifasi nima?",
            options: ["Qonni haydash", "Ovqat hazm qilish", "Nafas olish", "Gormon ishlab chiqarish"],
            correct_answer: "Qonni haydash",
            explanation: "Yurak qon aylanish tizimining asosiy nasos organidir."
          }
        ]
      });
    }

    const prompt = `
      Sinf: ${grade}
      Fan: ${subject}
      Mavzu: ${topic}
      Savollar soni: ${questionsCount}
      Qiyinlik: ${difficulty || "O'rta"}

      Ushbu mavzu bo'yicha ${questionsCount} ta test savolini yaratib ber.
      Javob faqat JSON bo'lishi kerak. Strukturasi:
      {
        "questions": [
          {
            "question": "Savol matni",
            "options": ["A variant", "B variant", "C variant", "D variant"],
            "correct_answer": "To'g'ri variant matni",
            "explanation": "Qisqa izoh"
          }
        ]
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
    console.error("Test Generator error:", error);
    return NextResponse.json({ error: "Test yaratishda xatolik yuz berdi.", details: error.message }, { status: 500 });
  }
}
