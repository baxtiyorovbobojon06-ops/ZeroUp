"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight, Globe, Bell, Check } from "lucide-react";
import toast from "react-hot-toast";
import { useSettings } from "@/contexts/SettingsContext";
import { Language } from "@/utils/translations";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type ViewState = 'main' | 'language' | 'profile' | 'notifications';

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'uz', label: "O'zbekcha" },
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'English' },
];

export default function SettingsPage() {
  const router = useRouter();
  const {
    language, profileName, notificationsEnabled, notificationsMuted,
    setLanguage, setProfileName, setNotificationsEnabled, setNotificationsMuted, t
  } = useSettings();

  const [currentView, setCurrentView] = useState<ViewState>('main');
  const [tempName, setTempName] = useState(profileName);

  useEffect(() => {
    document.getElementById('app-main')?.scrollTo(0, 0);
  }, [currentView]);

  const handleSaveProfile = () => {
    if (tempName.trim().length === 0) {
      toast.error("Ism bo'sh bo'lishi mumkin emas");
      return;
    }
    setProfileName(tempName);
    toast.success(t("saved_msg"));
    setCurrentView('main');
  };

  const renderMainView = () => (
    <Card className="p-0 overflow-hidden divide-y" style={{ borderColor: "var(--card-border)" }}>
      <button onClick={() => setCurrentView('profile')} className="w-full flex items-center p-4 text-left">
        <div className="w-11 h-11 rounded-full flex items-center justify-center font-medium shrink-0" style={{ background: "var(--accent-bg-tint)", color: "var(--accent-primary-hover)" }}>
          {profileName ? profileName.charAt(0).toUpperCase() : "O'"}
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-[var(--text-primary)]">{profileName || "O'qituvchi"}</h3>
          <p className="text-xs text-[var(--text-muted)]">{t("profile_desc")}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
      </button>

      <button onClick={() => setCurrentView('language')} className="w-full flex items-center p-4 text-left">
        <div className="w-[34px] h-[34px] rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--accent-bg-tint)", color: "var(--accent-primary)" }}>
          <Globe className="w-4 h-4" />
        </div>
        <h3 className="ml-3 flex-1 text-sm font-medium text-[var(--text-primary)]">{t("lang_title")}</h3>
        <span className="text-xs text-[var(--text-muted)] mr-2">{LANGUAGES.find(l => l.code === language)?.label}</span>
        <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
      </button>

      <button onClick={() => setCurrentView('notifications')} className="w-full flex items-center p-4 text-left">
        <div className="w-[34px] h-[34px] rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--accent-bg-tint)", color: "var(--accent-primary)" }}>
          <Bell className="w-4 h-4" />
        </div>
        <h3 className="ml-3 flex-1 text-sm font-medium text-[var(--text-primary)]">{t("notifications_title")}</h3>
        <span className="text-xs text-[var(--text-muted)] mr-2">{notificationsEnabled ? "Yoqilgan" : "O'chirilgan"}</span>
        <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
      </button>
    </Card>
  );

  const renderProfileView = () => (
    <Card className="space-y-4">
      <Input
        label={t("profile_name_label")}
        value={tempName}
        onChange={(e) => setTempName(e.target.value)}
      />
      <Button className="w-full" onClick={handleSaveProfile}>{t("save_btn")}</Button>
    </Card>
  );

  const renderLanguageView = () => (
    <Card className="p-0 overflow-hidden divide-y" style={{ borderColor: "var(--card-border)" }}>
      {LANGUAGES.map(lang => (
        <button
          key={lang.code}
          onClick={() => { setLanguage(lang.code); toast.success(t("saved_msg")); }}
          className="w-full flex items-center justify-between p-4 text-left"
        >
          <span className="text-sm font-medium text-[var(--text-primary)]">{lang.label}</span>
          {language === lang.code && <Check className="w-4 h-4" style={{ color: "var(--accent-primary)" }} />}
        </button>
      ))}
    </Card>
  );

  const renderNotificationsView = () => (
    <Card className="p-0 overflow-hidden divide-y" style={{ borderColor: "var(--card-border)" }}>
      <div className="flex items-center justify-between p-4">
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">{t("notifications_enable")}</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{t("notifications_enable_desc")}</p>
        </div>
        <button
          onClick={() => setNotificationsEnabled(!notificationsEnabled)}
          className="w-10 h-6 rounded-full shrink-0 relative transition-colors"
          style={{ background: notificationsEnabled ? "var(--accent-primary)" : "var(--card-border)" }}
        >
          <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform" style={{ transform: notificationsEnabled ? "translateX(18px)" : "translateX(2px)" }} />
        </button>
      </div>
      <div className="flex items-center justify-between p-4">
        <p className="text-sm font-medium text-[var(--text-primary)]">Ovozsiz rejim</p>
        <button
          onClick={() => setNotificationsMuted(!notificationsMuted)}
          className="w-10 h-6 rounded-full shrink-0 relative transition-colors"
          style={{ background: notificationsMuted ? "var(--accent-primary)" : "var(--card-border)" }}
        >
          <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform" style={{ transform: notificationsMuted ? "translateX(18px)" : "translateX(2px)" }} />
        </button>
      </div>
    </Card>
  );

  const back = () => currentView === 'main' ? router.back() : setCurrentView('main');

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={back} className="p-1 text-[var(--text-secondary)]">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-medium text-[var(--text-primary)]">{t("settings_title")}</h1>
          {currentView === 'main' && <p className="text-xs text-[var(--text-muted)]">{t("settings_desc")}</p>}
        </div>
      </div>

      {currentView === 'main' && renderMainView()}
      {currentView === 'profile' && renderProfileView()}
      {currentView === 'language' && renderLanguageView()}
      {currentView === 'notifications' && renderNotificationsView()}
    </div>
  );
}
