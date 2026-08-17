export type ReportStats = {
  oquvchilarSoni: number;
  davomatFoizi: number;
  tekshirilganVaraqlar: number;
  ozlashtirishFoizi: number;
  pastOzlashtirganlar: {
    studentId: string;
    ism: string;
    ozlashtirishFoizi: number;
    sabab: string;
  }[];
};

export type ReportAiAnalysis = {
  metodikaTahlili: string;
  etiborKerakOquvchilar: { ism: string; sabab: string; tavsiya: string }[];
};
