import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import type { ClassDashboardStats, ChorakStat } from '@/lib/types/dashboardStats';

// O'zbekiston maktablarining odatiy o'quv chorak taqvimiga taxminiy mos:
// I-chorak sentabr-oktabr, II-chorak noyabr-dekabr, III-chorak yanvar-mart,
// IV-chorak aprel-may. Yozgi oylar (iyun-avgust) hech qaysi chorakka kirmaydi.
function getChorak(date: Date): 1 | 2 | 3 | 4 | null {
  const month = date.getMonth() + 1;
  if (month === 9 || month === 10) return 1;
  if (month === 11 || month === 12) return 2;
  if (month === 1 || month === 2 || month === 3) return 3;
  if (month === 4 || month === 5) return 4;
  return null;
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Sinf ID si topilmadi" }, { status: 400 });
    }

    const [studentCount, testCount, attempts] = await Promise.all([
      db.student.count({ where: { classId: id } }),
      db.test.count({ where: { classId: id } }),
      db.testAttempt.findMany({
        where: { test: { classId: id } },
        select: { testId: true, percentage: true, test: { select: { date: true } } },
      }),
    ]);

    const checkedTestIds = new Set(attempts.map((a) => a.testId));
    const ozlashtirishFoizi = attempts.length > 0
      ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length)
      : 0;

    const buckets = new Map<1 | 2 | 3 | 4, { sum: number; count: number; testIds: Set<string> }>();
    for (const a of attempts) {
      const chorak = getChorak(a.test.date);
      if (!chorak) continue;
      if (!buckets.has(chorak)) buckets.set(chorak, { sum: 0, count: 0, testIds: new Set() });
      const bucket = buckets.get(chorak)!;
      bucket.sum += a.percentage;
      bucket.count += 1;
      bucket.testIds.add(a.testId);
    }

    const choraklar: ChorakStat[] = ([1, 2, 3, 4] as const).map((chorak) => {
      const bucket = buckets.get(chorak);
      return {
        chorak,
        ozlashtirishFoizi: bucket && bucket.count > 0 ? Math.round(bucket.sum / bucket.count) : 0,
        testlarSoni: bucket ? bucket.testIds.size : 0,
      };
    });

    const result: ClassDashboardStats = {
      oquvchilarSoni: studentCount,
      testlarSoni: testCount,
      tekshirilganTestlarSoni: checkedTestIds.size,
      ozlashtirishFoizi,
      choraklar,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/classes/[id]/dashboard-stats error:", error);
    return NextResponse.json({ error: "Statistikani yuklashda xatolik yuz berdi" }, { status: 500 });
  }
}
