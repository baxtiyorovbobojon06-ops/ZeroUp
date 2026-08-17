export type ChorakStat = {
  chorak: 1 | 2 | 3 | 4;
  ozlashtirishFoizi: number;
  testlarSoni: number;
};

export type ClassDashboardStats = {
  oquvchilarSoni: number;
  testlarSoni: number;
  tekshirilganTestlarSoni: number;
  ozlashtirishFoizi: number;
  choraklar: ChorakStat[];
};
