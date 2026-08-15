import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamObject } from 'ai';
import { z } from 'zod';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { assignment, images } = await request.json();

    if (!assignment) {
      return new Response(JSON.stringify({ error: "Topshiriq shartini kiriting" }), { status: 400 });
    }
    
    if (!images || images.length === 0) {
      return new Response(JSON.stringify({ error: "Hech bo'lmasa bitta rasm yuklang" }), { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "API kalit o'rnatilmagan" }), { status: 500 });
    }

    const promptText = `
Sen tajribali va adolatli maktab o'qituvchisisan. Quyidagi topshiriq sharti asosida o'quvchilar tomonidan yuborilgan rasmlardagi javoblarni tahlil qil.
Topshiriq sharti: ${assignment}

Qoidalar:
1. Yuborilgan barcha rasmlardagi yozuvlarni diqqat bilan o'qi.
2. Har bir rasm bitta o'quvchining ishi deb hisobla.
3. Rasmdan o'quvchining ism-sharifini topishga harakat qil. Agar ism yozilmagan bo'lsa, "Rasm [raqami]" deb nomla.
4. O'quvchining javobi qanchalik to'g'riligiga qarab uni bahola (score) - masalan: 100/100 yoki 5 baholik tizimda.
5. Har bir o'quvchi uchun umumiy xulosa, aniq xatolarini (mistakes) va uning statusini (To'g'ri, Xato, Qisman to'g'ri) belgilab ber.

Faqat ko'rsatilgan JSON strukturada javob qaytar!
    `;

    const schema = z.object({
      results: z.array(
        z.object({
          student_name: z.string().describe("O'quvchining ismi yoki Rasm tartib raqami"),
          score: z.string().describe("Yakuniy baho (masalan 100/100, 5/5, 80%)"),
          status: z.enum(["To'g'ri", "Xato", "Qisman to'g'ri"]).describe("Javob holati"),
          mistakes: z.array(z.string()).describe("Xatolar ro'yxati (to'g'ri bo'lsa bo'sh qoldiring)"),
          feedback: z.string().describe("O'qituvchi tomonidan qisqacha xulosa va tavsiya"),
        })
      ).describe("Har bir rasm uchun tekshiruv natijalari")
    });

    // Prepare message content combining text and all uploaded images
    const messageContent: any[] = [{ type: 'text', text: promptText }];
    
    for (const img of images) {
      messageContent.push({
        type: 'image',
        image: img.data, // Base64 data (without data:image/xxx;base64, prefix)
      });
    }

    const result = await streamObject({
      model: google('gemini-3.5-flash'), // gemini-3.5-flash has great vision capabilities
      schema: schema,
      messages: [{ role: 'user', content: messageContent }],
    });

    return result.toTextStreamResponse();

  } catch (error: any) {
    console.error("Grader API error:", error);
    return new Response(JSON.stringify({ error: "Tekshirishda xatolik yuz berdi.", details: error.message }), { status: 500 });
  }
}
