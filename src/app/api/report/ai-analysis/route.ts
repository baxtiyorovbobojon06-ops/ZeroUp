import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { db } from '@/utils/db';
import { getReportStats } from '@/lib/server/report';
import type { ReportAiAnalysis } from '@/lib/types/report';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function GET() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "AI tahlil sozlanmagan (GEMINI_API_KEY yo'q)" }, { status: 502 });
    }

    const stats = await getReportStats();

    const attempts = await db.testAttempt.findMany({
      select: {
        percentage: true,
        createdAt: true,
        student: { select: { firstName: true, lastName: true } },
        test: { select: { subject: true, title: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    const urinishlarTarixi = attempts.map((a) => ({
      ism: `${a.student.firstName} ${a.student.lastName}`,
      fan: a.test.subject,
      mavzu: a.test.title,
      foiz: Math.round(a.percentage),
      sana: a.createdAt.toISOString().slice(0, 10),
    }));

    const prompt = `
      Sen maktab ta'lim tahlilchisan. Quyidagi statistika va o'quvchilarning urinishlar tarixi
      asosida qisqa, aniq va amaliy tahlil ber. Uzun umumiy gaplardan qoch — har bir xulosa
      aniq faktga (ball, test, mavzu, takrorlanish) asoslangan bo'lsin. Javob faqat o'zbek
      tilida bo'lsin.

      Statistika: ${JSON.stringify(stats)}
      Urinishlar tarixi (vaqt bo'yicha tartiblangan): ${JSON.stringify(urinishlarTarixi)}

      MUHIM: Dastur interfeysi ishlashi uchun javobni aynan quyidagi JSON formatida qaytarishing shart:
      {
        "metodikaTahlili": "2-3 gap: o'qituvchining test/dars uslubi natijalarga qanday ta'sir qilayotgani, vaqt o'tishi bilan natijalar yaxshilanyaptimi yoki yomonlashyaptimi",
        "etiborKerakOquvchilar": [
          { "ism": "...", "sabab": "...", "tavsiya": "..." }
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

    let parsed: ReportAiAnalysis;
    try {
      parsed = JSON.parse(content);
    } catch {
      console.error("AI-analysis JSON parse error. Raw content:", content);
      return NextResponse.json({ error: "AI javobini qayta ishlab bo'lmadi" }, { status: 502 });
    }

    return NextResponse.json(parsed);

  } catch (error) {
    console.error("GET /api/report/ai-analysis error:", error);
    const details = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "AI tahlilida xatolik yuz berdi", details }, { status: 502 });
  }
}
