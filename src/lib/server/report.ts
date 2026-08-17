import { db } from "@/utils/db";
import type { ReportStats } from "@/lib/types/report";

export const LOW_PERFORMANCE_THRESHOLD = 60;

export async function getReportStats(): Promise<ReportStats> {
  const [studentCount, attemptCount, tests, studentsByClass] = await Promise.all([
    db.student.count(),
    db.testAttempt.count(),
    db.test.findMany({ select: { classId: true } }),
    db.student.findMany({ select: { classId: true } }),
  ]);

  const classSizeMap = new Map<string, number>();
  for (const s of studentsByClass) {
    classSizeMap.set(s.classId, (classSizeMap.get(s.classId) ?? 0) + 1);
  }
  const expectedSubmissions = tests.reduce((sum, t) => sum + (classSizeMap.get(t.classId) ?? 0), 0);

  const submittedPairs = await db.testAttempt.findMany({
    select: { testId: true, studentId: true },
    distinct: ["testId", "studentId"],
  });
  const davomatFoizi = expectedSubmissions > 0
    ? Math.round((submittedPairs.length / expectedSubmissions) * 100)
    : 0;

  const attempts = await db.testAttempt.findMany({ select: { percentage: true } });
  const ozlashtirishFoizi = attempts.length > 0
    ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length)
    : 0;

  const students = await db.student.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      attempts: { select: { percentage: true } },
    },
  });

  const pastOzlashtirganlar = students
    .map((student) => {
      if (student.attempts.length === 0) return null;
      const avg = Math.round(
        student.attempts.reduce((sum, a) => sum + a.percentage, 0) / student.attempts.length
      );
      return {
        studentId: student.id,
        ism: `${student.firstName} ${student.lastName}`,
        ozlashtirishFoizi: avg,
        sabab: `So'nggi ${student.attempts.length} ta urinishda o'rtacha ${avg}% natija`,
      };
    })
    .filter(
      (entry): entry is NonNullable<typeof entry> =>
        entry !== null && entry.ozlashtirishFoizi < LOW_PERFORMANCE_THRESHOLD
    )
    .sort((a, b) => a.ozlashtirishFoizi - b.ozlashtirishFoizi);

  return {
    oquvchilarSoni: studentCount,
    davomatFoizi,
    tekshirilganVaraqlar: attemptCount,
    ozlashtirishFoizi,
    pastOzlashtirganlar,
  };
}
