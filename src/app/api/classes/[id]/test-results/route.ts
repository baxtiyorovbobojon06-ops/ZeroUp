import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { classifyGrade } from '@/lib/server/grading';
import type { ClassTestResult, StudentTestResult } from '@/lib/types/classResults';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Sinf ID si topilmadi" }, { status: 400 });
    }

    const tests = await db.test.findMany({
      where: { classId: id },
      orderBy: { date: 'desc' },
      include: {
        attempts: {
          orderBy: { percentage: 'asc' },
          include: {
            student: { select: { id: true, firstName: true, lastName: true } },
            answers: { where: { isCorrect: false }, orderBy: { questionNumber: 'asc' } },
          },
        },
      },
    });

    const results: ClassTestResult[] = tests
      .filter((t) => t.attempts.length > 0)
      .map((t) => {
        const natijalar: StudentTestResult[] = t.attempts.map((a) => ({
          attemptId: a.id,
          studentId: a.studentId,
          ism: `${a.student.firstName} ${a.student.lastName}`,
          foiz: Math.round(a.percentage),
          baho: classifyGrade(a.percentage),
          xatoSavollar: a.answers.map((ans) => ({
            savolRaqami: ans.questionNumber,
            oquvchiJavobi: ans.studentAnswer,
            togriJavob: ans.correctAnswer,
          })),
        }));

        return {
          testId: t.id,
          sarlavha: t.title,
          fan: t.subject,
          sana: t.date.toISOString(),
          natijalar,
        };
      });

    return NextResponse.json(results);
  } catch (error) {
    console.error("GET /api/classes/[id]/test-results error:", error);
    return NextResponse.json({ error: "Test natijalarini yuklashda xatolik yuz berdi" }, { status: 500 });
  }
}
