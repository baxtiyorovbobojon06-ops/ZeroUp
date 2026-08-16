import { NextResponse } from 'next/server';
import { db } from '@/utils/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { testId, classId, results } = body;
    
    if (!testId || !classId || !results || !Array.isArray(results)) {
      return NextResponse.json({ error: "Ma'lumotlar to'liq emas" }, { status: 400 });
    }
    
    // Fetch existing students for matching
    const existingStudents = await db.student.findMany({
      where: { classId }
    });
    
    const savedAttempts = [];
    
    // Save results one by one
    for (const res of results) {
      const studentName = (res.student_name || "Noma'lum").trim();
      
      // Attempt to match by name (basic case-insensitive match)
      let student = existingStudents.find(s => 
        studentName.toLowerCase().includes(s.firstName.toLowerCase()) || 
        studentName.toLowerCase().includes(s.lastName.toLowerCase())
      );
      
      // If no student found, create a new one to prevent data loss
      if (!student) {
        student = await db.student.create({
          data: {
            firstName: studentName,
            lastName: "(Aniqlanmagan)",
            classId
          }
        });
        existingStudents.push(student); // add to cache
      }
      
      // Check if attempt already exists for this test and student
      let attempt = await db.testAttempt.findFirst({
        where: { testId, studentId: student.id }
      });
      
      // Create new attempt
      if (!attempt) {
        const correctCount = res.answers?.filter((a: any) => a.isCorrect).length || 0;
        const unansweredCount = res.answers?.filter((a: any) => a.studentAnswer === "-").length || 0;
        const totalCount = res.answers?.length || 1;
        const incorrectCount = totalCount - correctCount - unansweredCount;
        
        attempt = await db.testAttempt.create({
          data: {
            testId,
            studentId: student.id,
            variant: res.variant,
            score: res.score,
            percentage: res.percentage,
            correctCount,
            incorrectCount,
            unansweredCount,
            needsReview: res.answers?.some((a: any) => (a.confidence || 1) < 0.8) || false,
            answers: {
              create: res.answers?.map((ans: any) => ({
                questionNumber: ans.question,
                studentAnswer: ans.studentAnswer,
                correctAnswer: ans.correctAnswer,
                isCorrect: ans.isCorrect,
                confidence: ans.confidence || 1,
                isUncertain: (ans.confidence || 1) < 0.8
              })) || []
            }
          }
        });
        
        savedAttempts.push(attempt);
      }
    }
    
    // Update Report for this test
    const allAttempts = await db.testAttempt.findMany({
      where: { testId }
    });
    
    if (allAttempts.length > 0) {
      const avgScore = allAttempts.reduce((sum, a) => sum + a.score, 0) / allAttempts.length;
      const scores = allAttempts.map(a => a.score);
      const high = Math.max(...scores);
      const low = Math.min(...scores);
      
      // upsert report
      const existingReport = await db.report.findFirst({ where: { testId } });
      if (existingReport) {
        await db.report.update({
          where: { id: existingReport.id },
          data: {
            averageScore: avgScore,
            highestScore: high,
            lowestScore: low
          }
        });
      } else {
        await db.report.create({
          data: {
            testId,
            classId,
            averageScore: avgScore,
            highestScore: high,
            lowestScore: low,
            aiSummary: "Tahlil qilinmoqda..."
          }
        });
      }
    }
    
    return NextResponse.json({ success: true, count: savedAttempts.length });
  } catch (error) {
    console.error("POST /api/attempts error:", error);
    return NextResponse.json({ error: "Natijalarni saqlashda xatolik yuz berdi" }, { status: 500 });
  }
}
