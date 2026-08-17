"use client";

import Link from "next/link";
import { FileSignature, FileBarChart, Settings, ChevronRight, LogOut } from "lucide-react";
import toast from "react-hot-toast";
import { useSettings } from "@/contexts/SettingsContext";

const items = [
  { label: "Testlar", href: "/more/tests", icon: FileSignature, color: "#378ADD" },
  { label: "Hisobot", href: "/more/report", icon: FileBarChart, color: "#3B6D11" },
  { label: "Sozlamalar", href: "/more/settings", icon: Settings, color: "#378ADD" },
];

export default function MorePage() {
  const { profileName } = useSettings();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-medium text-[var(--text-primary)]">Ko&apos;proq</h1>
        <p className="text-xs text-[var(--text-muted)]">Qo&apos;shimcha bo&apos;limlar va sozlamalar</p>
      </div>

      <div className="rounded-[var(--radius-card)] bg-[var(--card-bg)] border-[0.5px] border-[var(--card-border)] divide-y divide-[var(--card-border)] overflow-hidden">
        {items.map((item) => (
          <Link key={item.label} href={item.href} className="flex items-center gap-3 p-4">
            <div
              className="w-[34px] h-[34px] rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "var(--accent-bg-tint)", color: item.color }}
            >
              <item.icon className="w-4 h-4" />
            </div>
            <span className="flex-1 text-sm font-medium text-[var(--text-primary)]">{item.label}</span>
            <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-3 p-4 rounded-[var(--radius-card)] bg-[var(--card-bg)] border-[0.5px] border-[var(--card-border)]">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center font-medium shrink-0"
          style={{ background: "var(--accent-bg-tint)", color: "var(--accent-primary-hover)" }}
        >
          {profileName ? profileName.charAt(0).toUpperCase() : "O'"}
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">{profileName || "O'qituvchi"}</p>
          {/* Rol hozircha frontendda sobit qiymat — backendda user/role modeli tayyor bo'lgach ulanadi */}
          <p className="text-xs text-[var(--text-muted)]">O&apos;qituvchi</p>
        </div>
      </div>

      <button
        onClick={() => toast("Tizimdan chiqish hali ulanmagan")}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-[var(--radius)] border text-sm font-medium"
        style={{ borderColor: "var(--danger-border)", color: "var(--danger-text)" }}
      >
        <LogOut className="w-4 h-4" /> Chiqish
      </button>
    </div>
  );
}
