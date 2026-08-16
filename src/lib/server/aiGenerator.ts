import OpenAI from "openai";

export interface GeneratedQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

interface GenerateParams {
  fan: string;
  sinf: string;
  mavzu: string;
  savollarSoni: number;
  qiyinlik: string;
}

// Provider GENERATOR_API_KEY / GENERATOR_API_BASE_URL / GENERATOR_MODEL orqali .env'da
// sozlanadi. OpenAI-mos chat completions API (OpenAI, DeepSeek va shu kabi gateway'lar)
// kutiladi. Agar Anthropic Claude ishlatilsa, bu funksiya @anthropic-ai/sdk bilan
// almashtirilishi kerak, chunki uning API shakli boshqacha.
export async function generateTestQuestions({
  fan,
  sinf,
  mavzu,
  savollarSoni,
  qiyinlik,
}: GenerateParams): Promise<GeneratedQuestion[]> {
  const apiKey = process.env.GENERATOR_API_KEY;
  if (!apiKey) {
    throw new Error("GENERATOR_API_KEY o'rnatilmagan. .env fayliga AI provider kalitini qo'shing.");
  }

  const client = new OpenAI({
    apiKey,
    baseURL: process.env.GENERATOR_API_BASE_URL || undefined,
  });

  const prompt = `
Sen O'zbekiston ta'lim standartlariga mos test tuzuvchi sun'iy intellekt agentisan. Quyidagi shartlar asosida test savollarini tuzib ber:

Fan: ${fan}
Sinf: ${sinf}
Mavzu: ${mavzu}
Savollar soni: ${savollarSoni} ta
Qiyinlik darajasi: ${qiyinlik}

Har bir savol 4 ta variantli (A, B, C, D) bo'lsin va to'g'ri javobi hamda qisqacha izohi ko'rsatilsin.

MUHIM: Javobing faqat va faqat quyidagi JSON formatida bo'lishi shart:
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

  const completion = await client.chat.completions.create({
    model: process.env.GENERATOR_MODEL || "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("AI provider bo'sh javob qaytardi");
  }

  const parsed = JSON.parse(content);
  if (!Array.isArray(parsed.questions)) {
    throw new Error("AI javobi noto'g'ri formatda");
  }

  return parsed.questions.map((q: any) => ({
    question: String(q.question),
    options: Array.isArray(q.options) ? q.options.map(String) : [],
    correctAnswer: String(q.correct_answer ?? q.correctAnswer ?? ""),
    explanation: q.explanation ? String(q.explanation) : undefined,
  }));
}
