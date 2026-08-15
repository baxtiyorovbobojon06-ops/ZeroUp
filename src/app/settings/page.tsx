"use client";

import { useState } from "react";
import { Settings, Moon, Sun, Globe, User, Save, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { useSettings } from "@/contexts/SettingsContext";
import { Language } from "@/utils/translations";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function SettingsPage() {
  const { theme, language, profileName, setTheme, setLanguage, setProfileName, t } = useSettings();
  
  // Local state for the input before saving
  const [tempName, setTempName] = useState(profileName);

  const handleSaveProfile = () => {
    if (tempName.trim().length === 0) {
      toast.error("Ism bo'sh bo'lishi mumkin emas");
      return;
    }
    setProfileName(tempName);
    toast.success(t("saved_msg"));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl flex items-center justify-center shadow-sm">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t("settings_title")}</h1>
          <p className="text-slate-500 dark:text-slate-400">{t("settings_desc")}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Theme Settings */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-white/60 dark:border-slate-700/60">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
              {theme === 'dark' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t("theme_title")}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t("theme_desc")}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-center gap-2 font-medium transition-all ${
                    theme === 'light' 
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/50 dark:border-indigo-500/50 dark:text-indigo-300' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700'
                  }`}
                >
                  <Sun className="w-4 h-4" /> {t("theme_light")}
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-center gap-2 font-medium transition-all ${
                    theme === 'dark' 
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/50 dark:border-indigo-500/50 dark:text-indigo-300' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700'
                  }`}
                >
                  <Moon className="w-4 h-4" /> {t("theme_dark")}
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Language Settings */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-white/60 dark:border-slate-700/60">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Globe className="w-6 h-6" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t("lang_title")}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t("lang_desc")}</p>
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-slate-200 transition-colors"
              >
                <option value="uz">O'zbek tili</option>
                <option value="ru">Русский язык</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Profile Settings */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-white/60 dark:border-slate-700/60 md:col-span-2">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl">
              <User className="w-6 h-6" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t("profile_title")}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t("profile_desc")}</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {t("profile_name_label")}
                  </label>
                  <input 
                    type="text" 
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 dark:text-slate-200 transition-colors"
                    placeholder="Masalan: Alisher Navoiy"
                  />
                </div>
                <Button 
                  onClick={handleSaveProfile}
                  className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white"
                  leftIcon={<Save className="w-5 h-5" />}
                >
                  {t("save_btn")}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
