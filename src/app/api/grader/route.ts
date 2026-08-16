import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamObject, type UserContent } from 'ai';
import { z } from 'zod';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { testId, answerKey, questionCount, images } = await request.json();

    if (!answerKey || !images || images.length === 0) {
      return new Response(JSON.stringify({ error: "Kerakli ma'lumotlar to'liq emas" }), { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "API kalit o'rnatilmagan" }), { status: 500 });
    }

    const promptText = `
Sen tajribali va juda aniq ishlaydigan maktab o'qituvchisisan.
Senga o'quvchilar tomonidan ishlangan test javob varaqalari (rasmlar) va testning TO'G'RI JAVOB KALITI berilgan.
Vazifang:
1. Har bir rasmdan o'quvchining ism-sharifini aniqlash. Agar topilmasa "No'malum o'quvchi" deb yoz.
2. O'quvchi qaysi variantni ishlaganini aniqlash (masalan, A, B). Topilmasa bo'sh qoldir.
3. Har bir savol (${questionCount} ta savol bo'lishi kerak) bo'yicha o'quvchi belgilagan javobni aniqla.
4. O'quvchi javobini berilgan JAVOB KALITI bilan solishtir. To'g'ri (isCorrect: true) yoki Xato (isCorrect: false) ekanini yoz.
5. Agar o'quvchi umuman belgilamagan bo'lsa, studentAnswer ni "-" qilib belgilab, xato hisobla.
6. Agar javob noaniq bo'lsa yoki ishonching komil bo'lmasa, confidence darajasini pasaytir (masalan 0.4 yoki 0.6). Ochiq ko'rinib tursa 0.9-1.0 ber.
7. Har bir o'quvchi uchun umumiy "score" (to'g'ri topganlar soni) va "percentage" (foiz) ni hisobla.

TO'G'RI JAVOB KALITI:
${answerKey}

Diqqat: Natijani faqat so'ralgan JSON formatida qaytar!
    `;

    const schema = z.object({
      results: z.array(
        z.object({
          student_name: z.string(),
          variant: z.string().describe("Agar aniqlansa, A, B, C... Agar yo'q bo'lsa bo'sh yozing"),
          score: z.number().describe("To'g'ri topilgan savollar soni"),
          percentage: z.number().describe("Foiz ko'rinishida, masalan 85"),
          answers: z.array(
            z.object({
              question: z.number().describe("Savol raqami"),
              studentAnswer: z.string().describe("O'quvchi belgilagan javob (A, B, C, D) yoki '-' javobsiz"),
              correctAnswer: z.string().describe("Kalitdagi to'g'ri javob"),
              isCorrect: z.boolean(),
              confidence: z.number().describe("Ishonch darajasi 0.0 dan 1.0 gacha")
            })
          )
        })
      )
    });

    const messageContent: UserContent = [{ type: 'text', text: promptText }];
    
    for (const img of images) {
      messageContent.push({
        type: 'image',
        image: img.data, 
      });
    }

    const result = await streamObject({
      model: google('gemini-3.5-flash'), 
      schema: schema,
      messages: [{ role: 'user', content: messageContent }],
    });

    return result.toTextStreamResponse();

  } catch (error) {
    console.error("Grader API error:", error);
    const details = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: "Tekshirishda xatolik yuz berdi.", details }), { status: 500 });
  }
}
