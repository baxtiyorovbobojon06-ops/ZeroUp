import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { db } from '@/utils/db';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Sinf ID si topilmadi" }, { status: 400 });
    }

    const [studentCount, tests] = await Promise.all([
      db.student.count({ where: { classId: id } }),
      db.test.findMany({
        where: { classId: id },
        select: {
          subject: true,
          title: true,
          attempts: { select: { percentage: true } },
        },
        orderBy: { date: 'desc' },
      }),
    ]);

    const testSummaries = tests
      .filter((t) => t.attempts.length > 0)
      .map((t) => ({
        fan: t.subject,
        mavzu: t.title,
        ortachaFoiz: Math.round(t.attempts.reduce((s, a) => s + a.percentage, 0) / t.attempts.length),
      }));

    if (testSummaries.length === 0) {
      return NextResponse.json({
        malumot: "Bu sinf uchun hali tekshirilgan test natijalari mavjud emas, shuning uchun AI aniq tavsiya bera olmaydi.",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "AI tahlil sozlanmagan (GEMINI_API_KEY yo'q)" }, { status: 502 });
    }

    const overallAvg = Math.round(
      testSummaries.reduce((s, t) => s + t.ortachaFoiz, 0) / testSummaries.length
    );
    const weakest = [...testSummaries].sort((a, b) => a.ortachaFoiz - b.ortachaFoiz).slice(0, 5);

    const prompt = `
      Sen tajribali metodistsan. Quyidagi sinf statistikasi asosida ushbu sinf uchun dars rejasi
      tuzayotgan o'qituvchiga foydali bo'ladigan qisqa, aniq va amaliy ma'lumot yoz: sinfning
      hozirgi bilim darajasi, qaysi mavzularda ko'proq qiynalishayotgani va darsda nimaga e'tibor
      qaratish kerakligi. 3-4 gapdan oshmasin, faktlarga (foiz, mavzu) asoslangan bo'lsin,
      o'zbek tilida yoz. Faqat matnning o'zini qaytar, sarlavha yoki formatlashsiz.

      O'quvchilar soni: ${studentCount}
      Umumiy o'rtacha natija: ${overallAvg}%
      Eng past natijali testlar: ${JSON.stringify(weakest)}
    `;

    const response = await genAI.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
    });

    const content = response.text;
    if (!content) throw new Error("No content");

    return NextResponse.json({ malumot: content.trim() });

  } catch (error) {
    console.error("GET /api/classes/[id]/lesson-insights error:", error);
    const details = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "AI ma'lumot olishda xatolik yuz berdi", details }, { status: 502 });
  }
}
