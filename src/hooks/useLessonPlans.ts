import { useState, useEffect } from 'react';

export interface LessonPhase {
  phase_name: string;
  duration: number;
  teacher_action: string;
  student_action: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: string;
}

export interface LessonPlanContent {
  title: string;
  image_prompt?: string;
  objectives: string[];
  resources: string[];
  phases: LessonPhase[];
  assessment: string;
  homework: string;
  quiz?: QuizQuestion[];
}

export interface LessonPlanRecord {
  id: string;
  classId: string;
  className: string;
  subject: string;
  date: string;
  content: LessonPlanContent;
}

const STORAGE_KEY = 'lessonPlans';

export function useLessonPlans() {
  const [plans, setPlans] = useState<LessonPlanRecord[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPlans(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse lesson plans', e);
      }
    }
    setIsLoaded(true);
  }, []);

  const persist = (next: LessonPlanRecord[]) => {
    setPlans(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const addPlan = (record: Omit<LessonPlanRecord, 'id' | 'date'>) => {
    const newRecord: LessonPlanRecord = {
      ...record,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    };
    persist([newRecord, ...plans]);
    return newRecord;
  };

  const updatePlan = (id: string, record: Omit<LessonPlanRecord, 'id' | 'date'>) => {
    persist(plans.map(p => p.id === id ? { ...record, id, date: new Date().toISOString() } : p));
  };

  const removePlan = (id: string) => {
    persist(plans.filter(p => p.id !== id));
  };

  return { plans, isLoaded, addPlan, updatePlan, removePlan };
}
