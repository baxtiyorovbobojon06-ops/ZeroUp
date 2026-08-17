import type { GradeLevel } from "@/lib/types/classResults";

export const GRADE_THRESHOLD_ALO = 85;
export const GRADE_THRESHOLD_YAXSHI = 60;

export function classifyGrade(percentage: number): GradeLevel {
  if (percentage >= GRADE_THRESHOLD_ALO) return "aLo";
  if (percentage >= GRADE_THRESHOLD_YAXSHI) return "yaxshi";
  return "yomon";
}
