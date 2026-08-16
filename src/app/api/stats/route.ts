import { NextResponse } from 'next/server';
import { db } from '@/utils/db';

export async function GET() {
  try {
    const classCount = await db.class.count();
    const testCount = await db.test.count();
    const studentCount = await db.student.count();
    const attemptCount = await db.testAttempt.count();
    
    // Average score of all attempts
    const attempts = await db.testAttempt.findMany({
      select: { score: true, percentage: true }
    });
    
    let avgPercentage = 0;
    if (attempts.length > 0) {
      avgPercentage = Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length);
    }

    // Recent tests with class and attempts info
    const recentTests = await db.test.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        class: true,
        _count: {
          select: { attempts: true }
        }
      }
    });

    return NextResponse.json({
      classCount,
      testCount,
      studentCount,
      attemptCount,
      avgPercentage,
      recentTests
    });
  } catch (error) {
    console.error("GET /api/stats error:", error);
    return NextResponse.json({ error: "Statistikani yuklashda xatolik yuz berdi" }, { status: 500 });
  }
}
