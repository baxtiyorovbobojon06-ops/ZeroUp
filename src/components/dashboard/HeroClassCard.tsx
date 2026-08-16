import Link from "next/link";
import { Users, ArrowRight } from "lucide-react";

interface ClassSummary {
  id: string;
  name: string;
  _count?: { students: number };
}

interface HeroClassCardProps {
  loading: boolean;
  classItem: ClassSummary | null;
  hasMultiple: boolean;
}

export function HeroClassCard({ loading, classItem, hasMultiple }: HeroClassCardProps) {
  if (loading) {
    return <div className="rounded-3xl bg-slate-100 dark:bg-slate-800 h-44 animate-pulse" />;
  }

  if (!classItem) {
    return (
      <div className="rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
            <Users className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold mb-1">Hali sinf yo&apos;q</h2>
          <p className="text-indigo-100 text-sm mb-5 opacity-90">Birinchi sinfingizni qo&apos;shib, o&apos;quvchilaringizni boshqarishni boshlang</p>
          <Link href="/classes" className="inline-flex items-center gap-1.5 bg-white text-indigo-600 text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors">
            Sinf qo&apos;shish <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white shadow-md relative overflow-hidden">
      <div className="relative z-10">
        <p className="text-indigo-100 text-xs font-semibold uppercase tracking-wider mb-2">Faol sinf</p>
        <h2 className="text-2xl font-bold mb-1">{classItem.name}</h2>
        <p className="text-indigo-100 text-sm mb-5">{classItem._count?.students || 0} ta o&apos;quvchi</p>
        {hasMultiple && (
          <Link href="/classes" className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/90 hover:text-white transition-colors">
            Sinflarni ko&apos;rish <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
    </div>
  );
}
