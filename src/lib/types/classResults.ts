export type GradeLevel = "aLo" | "yaxshi" | "yomon";

export type WrongAnswer = {
  savolRaqami: number;
  oquvchiJavobi: string | null;
  togriJavob: string | null;
};

export type StudentTestResult = {
  attemptId: string;
  studentId: string;
  ism: string;
  foiz: number;
  baho: GradeLevel;
  xatoSavollar: WrongAnswer[];
};

export type ClassTestResult = {
  testId: string;
  sarlavha: string;
  fan: string;
  sana: string;
  natijalar: StudentTestResult[];
};

export type WeakTopicRecommendation = {
  mavzular: string[];
  tavsiya: string;
};
