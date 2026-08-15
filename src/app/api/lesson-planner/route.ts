import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import mammoth from 'mammoth';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const grade = formData.get('grade') as string;
    const subject = formData.get('subject') as string;
    const topic = formData.get('topic') as string;
    const duration = formData.get('duration') as string;
    const file = formData.get('file') as File | null;

    if (!grade || !subject || !topic || !duration) {
      return NextResponse.json({ error: "Barcha asosiy maydonlarni to'ldiring" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "API kalit o'rnatilmagan" }, { status: 500 });
    }

    let inlineData = null;
    let extractedText = "";

    if (file) {
      const bytes = await file.arrayBuffer();
      const mimeType = file.type;

      if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ buffer: Buffer.from(bytes) });
        extractedText = result.value;
      } else if (mimeType === 'application/pdf' || mimeType.startsWith('image/')) {
        inlineData = {
          data: Buffer.from(bytes).toString('base64'),
          mimeType: mimeType
        };
      }
    }

    const promptText = `
Sen tajribali va zamonaviy maktab o'qituvchisisan. Quyidagi ma'lumotlar va taqdim etilgan qo'shimcha resurs (agar mavjud bo'lsa) asosida juda batafsil, interaktiv va ilg'or pedagogik usullarga asoslangan dars rejasini tuzib ber.
Faqat JSON formatda qaytar (hech qanday markdown qatnashmasin).

Sinf: ${grade}
Fan: ${subject}
Mavzu: ${topic}
Dars davomiyligi: ${duration} daqiqa
${extractedText ? `Qo'shimcha material matni: ${extractedText.substring(0, 15000)}...` : ""}

Kutilayotgan JSON Strukturasi:
{
  "title": "Mavzu nomi",
  "image_prompt": "A detailed descriptive prompt in ENGLISH for generating an image related to this specific topic. Example: 'A beautiful realistic photo of students learning about computer hardware, glowing motherboard, futuristic classroom, 8k resolution, cinematic lighting'.",
  "objectives": [
    "Maqsad 1 (Ta'limiy - bilish)", 
    "Maqsad 2 (Tarbiyaviy - his qilish)", 
    "Maqsad 3 (Rivojlantiruvchi - qo'llash)"
  ],
  "resources": ["Kitob", "Proyektor", "Xarita kabi darsga kerakli anjomlar va ko'rgazmalar"],
  "phases": [
    {
      "phase_name": "Tashkiliy qism va Motivatsiya",
      "duration": 5,
      "teacher_action": "O'qituvchi nima qiladi va darsga qanday qiziqtiradi (aniq harakatlar)",
      "student_action": "O'quvchilar nima qiladi va qanday javob qaytaradi"
    },
    {
      "phase_name": "Yangi mavzu bayoni (Muammoli vaziyat)",
      "duration": 15,
      "teacher_action": "O'qituvchi mavzuni qanday qiziqarli usulda tushuntiradi",
      "student_action": "O'quvchilar ishtiroki"
    },
    {
      "phase_name": "Mustahkamlash (Interaktiv o'yin yoki guruh ishi)",
      "duration": 15,
      "teacher_action": "Qanday o'yin yoki mashq o'tkaziladi",
      "student_action": "O'quvchilar qanday bajaradi"
    },
    {
      "phase_name": "Yakunlash va Refleksiya",
      "duration": 10,
      "teacher_action": "Dars qanday yakunlanadi, Qanday xulosa qilinadi",
      "student_action": "O'quvchilar fikri"
    }
  ],
  "assessment": "O'quvchilarni baholash mezoni va usuli (masalan: guruh ishi uchun 5 ball, faollik uchun...)",
  "homework": "Uyga vazifa (ijodiy, izlanish talab qiladigan va qiziqarli)",
  "quiz": [
    {
      "question": "Mavzu bo'yicha test savoli (jami 10 ta shunday savol bo'lishi shart)",
      "options": ["A variant", "B variant", "C variant", "D variant"],
      "correct_answer": "To'g'ri variant matni"
    }
  ]
}
    `;

    const parts = [];
    if (inlineData) {
      parts.push({ inlineData });
    }
    parts.push(promptText);

    const response = await genAI.models.generateContent({
      model: "gemini-3.5-flash",
      contents: parts,
      config: { responseMimeType: "application/json" }
    });

    const content = response.text;
    if (!content) throw new Error("No content received from Gemini");

    return NextResponse.json(JSON.parse(content));

  } catch (error: any) {
    console.error("Lesson Planner API error:", error);
    return NextResponse.json({ error: "Dars rejasini yaratishda xatolik yuz berdi.", details: error.message }, { status: 500 });
  }
}
