"use client";

import { useState } from "react";
import { Settings, Moon, Sun, Globe, User, Save, Type, Monitor } from "lucide-react";
import toast from "react-hot-toast";
import { useSettings } from "@/contexts/SettingsContext";
import { Language } from "@/utils/translations";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type FontSize = 'sm' | 'base' | 'lg';
type FontFamily = 'inter' | 'roboto' | 'nunito';

export default function SettingsPage() {
  const { 
    theme, language, fontSize, fontFamily, profileName, 
    setTheme, setLanguage, setFontSize, setFontFamily, setProfileName, t 
  } = useSettings();
  
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
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl flex items-center justify-center shadow-sm">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t("settings_title")}</h1>
          <p className="text-slate-500 dark:text-slate-400">{t("settings_desc")}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
          <Monitor className="w-5 h-5 text-indigo-500" />
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">{t("system_settings")}</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Theme Settings */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-white/60 dark:border-slate-700/60">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.4)] dark:shadow-[0_0_15px_rgba(99,102,241,0.2)]">
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
                    className={`flex-1 py-2 px-3 rounded-xl border flex items-center justify-center gap-2 font-medium transition-all ${
                      theme === 'light' 
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/50 dark:border-indigo-500/50 dark:text-indigo-300' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Sun className="w-4 h-4" /> {t("theme_light")}
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex-1 py-2 px-3 rounded-xl border flex items-center justify-center gap-2 font-medium transition-all ${
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
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.4)] dark:shadow-[0_0_15px_rgba(16,185,129,0.2)]">
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
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-slate-200 transition-colors"
                >
                  <option value="uz">O'zbek tili</option>
                  <option value="ru">Русский язык</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Font Size Settings */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-white/60 dark:border-slate-700/60">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.4)] dark:shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                <Type className="w-6 h-6" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t("font_size_title")}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{t("font_size_desc")}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFontSize('sm')}
                    className={`flex-1 py-2 px-2 text-sm rounded-xl border flex items-center justify-center font-medium transition-all ${
                      fontSize === 'sm' 
                        ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/50 dark:border-blue-500/50 dark:text-blue-300' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700'
                    }`}
                  >
                    {t("size_sm")}
                  </button>
                  <button
                    onClick={() => setFontSize('base')}
                    className={`flex-1 py-2 px-2 text-base rounded-xl border flex items-center justify-center font-medium transition-all ${
                      fontSize === 'base' 
                        ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/50 dark:border-blue-500/50 dark:text-blue-300' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700'
                    }`}
                  >
                    {t("size_base")}
                  </button>
                  <button
                    onClick={() => setFontSize('lg')}
                    className={`flex-1 py-2 px-2 text-lg rounded-xl border flex items-center justify-center font-medium transition-all ${
                      fontSize === 'lg' 
                        ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/50 dark:border-blue-500/50 dark:text-blue-300' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700'
                    }`}
                  >
                    {t("size_lg")}
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Font Family Settings */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-white/60 dark:border-slate-700/60">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.4)] dark:shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                <Type className="w-6 h-6" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t("font_family_title")}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{t("font_family_desc")}</p>
                </div>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value as FontFamily)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 dark:text-slate-200 transition-colors font-inherit"
                >
                  <option value="inter" className="font-inter">Inter (Zamonaviy)</option>
                  <option value="roboto" className="font-roboto">Roboto (Klassik)</option>
                  <option value="nunito" className="font-nunito">Nunito (Yumshoq)</option>
                </select>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
          <User className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">{t("profile_settings")}</h2>
        </div>

        {/* Profile Settings */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-white/60 dark:border-slate-700/60 md:w-[calc(50%-12px)]">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.4)] dark:shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <User className="w-6 h-6" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t("profile_title")}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t("profile_desc")}</p>
              </div>
              
              <div className="flex flex-col gap-3">
                <div className="w-full">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {t("profile_name_label")}
                  </label>
                  <input 
                    type="text" 
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 dark:text-slate-200 transition-colors"
                    placeholder="Masalan: Alisher Navoiy"
                  />
                </div>
                <Button 
                  onClick={handleSaveProfile}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white"
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
