import { db } from "@/utils/db";

export function generateSessionCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createUniqueSessionCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateSessionCode();
    const existing = await db.liveSession.findUnique({ where: { code } });
    if (!existing) return code;
  }
  throw new Error("Kod generatsiya qilib bo'lmadi, qaytadan urinib ko'ring");
}

export function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Deterministic shuffle so the same participant always sees the same option order on reload.
export function seededShuffle<T>(items: T[], seed: string): T[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const rand = () => {
    h = (h * 1664525 + 1013904223) >>> 0;
    return h / 0xffffffff;
  };
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
