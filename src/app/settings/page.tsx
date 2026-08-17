"use client";

import { useState } from "react";
import { Settings, Moon, Sun, Globe, User, Save, Type, Monitor, ChevronRight, ChevronLeft, Check, Bell, Palette, Zap } from "lucide-react";
import toast from "react-hot-toast";
import { useSettings, DesignTheme } from "@/contexts/SettingsContext";
import { Language } from "@/utils/translations";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type FontFamily = 'inter' | 'roboto' | 'nunito';

type ViewState = 'main' | 'system' | 'language' | 'profile' | 'notifications' | 'design';

export default function SettingsPage() {
  const {
    theme, language, fontSize, fontFamily, profileName, notificationsEnabled, notificationsMuted,
    neonMode, designTheme, primaryColor, neonGlowColor, iconColor,
    setTheme, setLanguage, setFontSize, setFontFamily, setProfileName, setNotificationsEnabled, setNotificationsMuted,
    setNeonMode, setDesignTheme, setPrimaryColor, setNeonGlowColor, setIconColor, setAppBgColor, setAppBgColorDark, t
  } = useSettings();
  
  const [currentView, setCurrentView] = useState<ViewState>('main');
  const [tempName, setTempName] = useState(profileName);
  const [hueValue, setHueValue] = useState(250);

  const hslToHex = (h: number, s: number, l: number) => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const handleHueChange = (val: string) => {
    const h = parseInt(val);
    setHueValue(h);
    const hex = hslToHex(h, 80, 55);
    setPrimaryColor(hex);
    setNeonGlowColor(hex);
    setIconColor(hex);
    setDesignTheme('custom');
  };
  
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'panel' | 'mute' | null;
  }>({ isOpen: false, type: null });

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
    <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
      <Card className="p-0 overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-white/60 dark:border-slate-700/60 divide-y divide-slate-100 dark:divide-slate-700">
        
        {/* Profile List Item */}
        <button 
          onClick={() => setCurrentView('profile')}
          className="w-full flex items-center p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group text-left"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(245,158,11,0.4)] group-hover:scale-105 transition-transform shrink-0">
            {profileName ? profileName.charAt(0).toUpperCase() : "O'"}
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{profileName || "O'qituvchi"}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t("profile_desc")}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-amber-500 transition-colors" />
        </button>

        {/* System Settings List Item */}
        <button 
          onClick={() => setCurrentView('system')}
          className="w-full flex items-center p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group text-left"
        >
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.4)] dark:shadow-[0_0_15px_rgba(99,102,241,0.2)] shrink-0 group-hover:scale-105 transition-transform">
            <Monitor className="w-6 h-6" />
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{t("system_settings")}</h3>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
        </button>

        {/* Design Settings List Item */}
        <button 
          onClick={() => setCurrentView('design')}
          className="w-full flex items-center p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group text-left"
        >
          <div className="p-3 bg-fuchsia-50 dark:bg-fuchsia-900/30 text-fuchsia-600 dark:text-fuchsia-400 rounded-xl shadow-[0_0_15px_rgba(217,70,239,0.4)] dark:shadow-[0_0_15px_rgba(217,70,239,0.2)] shrink-0 group-hover:scale-105 transition-transform">
            <Palette className="w-6 h-6" />
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Dizayn sozlanmalari</h3>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-fuchsia-500 transition-colors" />
        </button>

        {/* Language List Item */}
        <button 
          onClick={() => setCurrentView('language')}
          className="w-full flex items-center p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group text-left"
        >
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.4)] dark:shadow-[0_0_15px_rgba(16,185,129,0.2)] shrink-0 group-hover:scale-105 transition-transform">
            <Globe className="w-6 h-6" />
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{t("lang_title")}</h3>
          </div>
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            <span className="text-sm font-medium">
              {language === 'uz' ? "O'zbekcha" : language === 'ru' ? "Русский" : "English"}
            </span>
            <ChevronRight className="w-5 h-5" />
          </div>
        </button>

        {/* Notifications List Item */}
        <button 
          onClick={() => setCurrentView('notifications')}
          className="w-full flex items-center p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group text-left"
        >
          <div className="p-3 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl shadow-[0_0_15px_rgba(243,24,125,0.4)] dark:shadow-[0_0_15px_rgba(243,24,125,0.2)] shrink-0 group-hover:scale-105 transition-transform">
            <Bell className="w-6 h-6" />
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{t("notifications_title")}</h3>
          </div>
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
            <span className="text-sm font-medium">
              {notificationsEnabled ? "Yoqilgan" : "O'chirilgan"}
            </span>
            <ChevronRight className="w-5 h-5" />
          </div>
        </button>

      </Card>
    </div>
  );

  const renderSystemView = () => (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => setCurrentView('main')}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("system_settings")}</h2>
      </div>

      <div className="space-y-6">
        {/* Theme Settings */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-white/60 dark:border-slate-700/60">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.4)] dark:shadow-[0_0_15px_rgba(99,102,241,0.2)] shrink-0">
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

        {/* Font Size Settings */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-white/60 dark:border-slate-700/60">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.4)] dark:shadow-[0_0_15px_rgba(59,130,246,0.2)] shrink-0">
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
            <div className="p-3 bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.4)] dark:shadow-[0_0_15px_rgba(139,92,246,0.2)] shrink-0">
              <Type className="w-6 h-6" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t("font_family_title")}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t("font_family_desc")}</p>
              </div>
              <div className="space-y-2">
                {[
                  { id: 'inter', name: 'Inter (Zamonaviy)', class: 'font-inter' },
                  { id: 'roboto', name: 'Roboto (Klassik)', class: 'font-roboto' },
                  { id: 'nunito', name: 'Nunito (Yumshoq)', class: 'font-nunito' },
                ].map((font) => (
                  <button
                    key={font.id}
                    onClick={() => setFontFamily(font.id as FontFamily)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors ${font.class} ${
                      fontFamily === font.id
                        ? 'bg-violet-50 border-violet-200 text-violet-700 dark:bg-violet-900/50 dark:border-violet-500/50 dark:text-violet-300'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span className="font-medium text-lg">{font.name}</span>
                    {fontFamily === font.id && <Check className="w-5 h-5" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderLanguageView = () => (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => setCurrentView('main')}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("lang_title")}</h2>
      </div>

      <Card className="p-0 overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-white/60 dark:border-slate-700/60 divide-y divide-slate-100 dark:divide-slate-700">
        {[
          { code: 'uz', name: "O'zbekcha" },
          { code: 'ru', name: "Русский" },
          { code: 'en', name: "English" },
        ].map((lang) => (
          <button
            key={lang.code}
            onClick={() => {
              setLanguage(lang.code as Language);
              setCurrentView('main'); // Go back after selecting
            }}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <span className={`text-base ${language === lang.code ? 'font-bold text-emerald-600 dark:text-emerald-400' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
              {lang.name}
            </span>
            {language === lang.code && <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          </button>
        ))}
      </Card>
    </div>
  );

  const renderProfileView = () => (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => setCurrentView('main')}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("profile_title")}</h2>
      </div>

      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-white/60 dark:border-slate-700/60">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.4)] dark:shadow-[0_0_15px_rgba(245,158,11,0.2)] shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t("profile_desc")}</p>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="w-full">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t("profile_name_label")}
                </label>
                <input 
                  type="text" 
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 dark:text-slate-200 transition-colors"
                  placeholder="Masalan: Alisher Navoiy"
                />
              </div>
              <Button 
                onClick={handleSaveProfile}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 text-lg"
                leftIcon={<Save className="w-5 h-5" />}
              >
                {t("save_btn")}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderNotificationsView = () => (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => setCurrentView('main')}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("notifications_title")}</h2>
      </div>

      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-white/60 dark:border-slate-700/60">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl shadow-[0_0_15px_rgba(243,24,125,0.4)] dark:shadow-[0_0_15px_rgba(243,24,125,0.2)] shrink-0">
            <Bell className="w-6 h-6" />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t("notifications_desc")}</p>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100">{t("notifications_enable")}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t("notifications_enable_desc")}</p>
              </div>
              
              <button 
                onClick={() => {
                  if (notificationsEnabled) {
                    // It is currently enabled (disabled switch is OFF). We want to turn it ON (disable the panel).
                    setConfirmModal({ isOpen: true, type: 'panel' });
                  } else {
                    // It is currently disabled (disabled switch is ON). We want to turn it OFF (enable the panel).
                    setNotificationsEnabled(true);
                    toast.success(t("saved_msg"));
                  }
                }}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${!notificationsEnabled ? 'bg-rose-500' : 'bg-slate-300 dark:bg-slate-600'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${!notificationsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100">Ovozsizlantirish (Mute)</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">Bildirishnomalar kelganda ovoz chiqarmaslik</p>
              </div>
              
              <button 
                onClick={() => {
                  if (!notificationsMuted) {
                    setConfirmModal({ isOpen: true, type: 'mute' });
                  } else {
                    setNotificationsMuted(false);
                    toast.success(t("saved_msg"));
                  }
                }}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${notificationsMuted ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-600'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${notificationsMuted ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                Diqqat
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed">
                {confirmModal.type === 'panel' 
                  ? "Haqiqatan ham panelni o'chirasizmi?" 
                  : "Sizga yangi habarlar va ilova haqidagi yangiliklar kelishini o'tkazib yuborishingiz mumkin. Haqiqatan ham ovozsizlantirasizmi?"}
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setConfirmModal({ isOpen: false, type: null })}
                  className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Yo&apos;q
                </button>
                <button 
                  onClick={() => {
                    if (confirmModal.type === 'panel') {
                      setNotificationsEnabled(false);
                    } else if (confirmModal.type === 'mute') {
                      setNotificationsMuted(true);
                    }
                    toast.success(t("saved_msg"));
                    setConfirmModal({ isOpen: false, type: null });
                  }}
                  className={`flex-1 px-4 py-2 text-white rounded-xl font-medium transition-colors ${confirmModal.type === 'panel' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-amber-500 hover:bg-amber-600'}`}
                >
                  Ha, o&apos;chirish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderDesignView = () => (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => setCurrentView('main')}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Dizayn sozlanmalari</h2>
      </div>

      {/* Neon Mode Toggle */}
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-white/60 dark:border-slate-700/60">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-fuchsia-50 dark:bg-fuchsia-900/30 text-fuchsia-600 dark:text-fuchsia-400 rounded-xl shadow-[0_0_15px_rgba(217,70,239,0.4)] dark:shadow-[0_0_15px_rgba(217,70,239,0.2)] shrink-0">
            <Zap className="w-6 h-6" />
          </div>
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100">Neon Rejim</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">Yoritgichli neon effektlarini yoqish</p>
              </div>
              <button 
                onClick={() => setNeonMode(!neonMode)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${neonMode ? 'bg-fuchsia-500' : 'bg-slate-300 dark:bg-slate-600'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${neonMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Theme Presets */}
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-white/60 dark:border-slate-700/60">
        <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Tayyor ta&apos;lim temalari</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { id: 'default', name: 'Klassik', hex: '#6366f1', bg: '#f8fafc', bgDark: '#0f172a' },
            { id: 'ocean', name: 'Bilim dengizi', hex: '#0ea5e9', bg: '#f0f9ff', bgDark: '#082f49' },
            { id: 'emerald', name: 'Zamonaviy maktab', hex: '#10b981', bg: '#f0fdf4', bgDark: '#022c22' },
            { id: 'cyberpunk', name: 'Innovatsiya', hex: '#8b5cf6', bg: '#f5f3ff', bgDark: '#2e1065' },
            { id: 'sunset', name: 'Energiya', hex: '#f97316', bg: '#fff7ed', bgDark: '#431407' },
            { id: 'ruby', name: 'Faol ta\'lim', hex: '#e11d48', bg: '#fff1f2', bgDark: '#4c0519' },
          ].map(tPreset => (
            <button
              key={tPreset.id}
              onClick={() => {
                setDesignTheme(tPreset.id as DesignTheme);
                setPrimaryColor(tPreset.hex);
                setNeonGlowColor(tPreset.hex);
                setIconColor(tPreset.hex);
                setAppBgColor(tPreset.bg);
                setAppBgColorDark(tPreset.bgDark);
              }}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${designTheme === tPreset.id ? 'border-2 border-slate-900 dark:border-white shadow-md' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
            >
              <div className="w-8 h-8 rounded-full shadow-inner border border-black/10" style={{ backgroundColor: tPreset.hex }}></div>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{tPreset.name}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Custom Colors */}
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-white/60 dark:border-slate-700/60">
        <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Maxsus ranglar</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
            <div>
              <p className="font-medium text-slate-800 dark:text-slate-200">Asosiy tugmalar rangi</p>
              <p className="text-xs text-slate-500">Platformadagi muhim tugmalar</p>
            </div>
            <input 
              type="color" 
              value={primaryColor} 
              onChange={(e) => {
                setPrimaryColor(e.target.value);
                if (designTheme !== 'custom') setDesignTheme('custom');
              }}
              className="w-10 h-10 rounded cursor-pointer bg-transparent border-0"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
            <div>
              <p className="font-medium text-slate-800 dark:text-slate-200">Neon yoritgich rangi</p>
              <p className="text-xs text-slate-500">Soya va porlash effektlari</p>
            </div>
            <input 
              type="color" 
              value={neonGlowColor} 
              onChange={(e) => {
                setNeonGlowColor(e.target.value);
                if (designTheme !== 'custom') setDesignTheme('custom');
              }}
              className="w-10 h-10 rounded cursor-pointer bg-transparent border-0"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
            <div>
              <p className="font-medium text-slate-800 dark:text-slate-200">Sahifa ikonkalari rangi</p>
              <p className="text-xs text-slate-500">Menyu va sarlavhalardagi belgilar</p>
            </div>
            <input 
              type="color" 
              value={iconColor} 
              onChange={(e) => {
                setIconColor(e.target.value);
                if (designTheme !== 'custom') setDesignTheme('custom');
              }}
              className="w-10 h-10 rounded cursor-pointer bg-transparent border-0"
            />
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-700">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">Ranglar palitrasi (Tezkor tanlash)</p>
          <div className="relative flex items-center h-14 rounded-[2rem] p-1 bg-slate-100 dark:bg-slate-800 shadow-inner">
            <input 
              type="range" 
              min="0" max="360" 
              value={hueValue}
              onChange={(e) => handleHueChange(e.target.value)}
              className="w-full h-12 rounded-[2rem] appearance-none cursor-pointer outline-none 
                         [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-10 [&::-webkit-slider-thumb]:h-10 
                         [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_2px_10px_rgba(0,0,0,0.3)]
                         [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:active:scale-90"
              style={{
                background: `linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)`,
              }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-4 text-center">Yorug&apos;lik tugmasini siljitish orqali barcha qismlar uchun o&apos;zingizga yoqqan yorqin rangni tanlang.</p>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto py-4">
      {/* Header, only show if in main view to save space, or keep it always? */}
      {currentView === 'main' && (
        <div className="flex items-center gap-3 mb-8 animate-in fade-in duration-300">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
            <Settings className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t("settings_title")}</h1>
          </div>
        </div>
      )}

      {currentView === 'main' && renderMainView()}
      {currentView === 'system' && renderSystemView()}
      {currentView === 'language' && renderLanguageView()}
      {currentView === 'profile' && renderProfileView()}
      {currentView === 'notifications' && renderNotificationsView()}
      {currentView === 'design' && renderDesignView()}
    </div>
  );
}
