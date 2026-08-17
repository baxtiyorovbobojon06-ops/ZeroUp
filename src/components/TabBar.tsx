"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users2, CheckSquare, BookOpen, FileBarChart } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";

const tabItems = [
  { name: "Asosiy", href: "/", icon: LayoutDashboard },
  { name: "Sinflar", href: "/classes", icon: Users2 },
  { name: "Tekshirish", href: "/grader", icon: CheckSquare },
  { name: "Dars Rejasi", href: "/lesson-planner", icon: BookOpen },
  { name: "Hisobot", href: "/report", icon: FileBarChart },
];

export default function TabBar() {
  const pathname = usePathname();
  const { t } = useSettings();

  return (
    <nav className="bg-[var(--card-bg)] border-[0.5px] border-[var(--card-border)] rounded-[14px] px-1 py-2.5 flex items-center justify-between">
      {tabItems.map((item) => {
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            href={item.href}
            className="flex flex-col items-center gap-1 flex-1 py-1"
          >
            <Icon
              className="w-5 h-5"
              style={{ color: isActive ? "var(--accent-primary)" : "var(--text-muted)" }}
            />
            <span
              className="text-[10px]"
              style={{
                color: isActive ? "var(--accent-primary)" : "var(--text-muted)",
                fontWeight: isActive ? 500 : 400,
              }}
            >
              {t(item.name)}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
