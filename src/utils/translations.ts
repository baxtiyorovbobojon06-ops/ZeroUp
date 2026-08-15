export type Language = 'uz' | 'ru' | 'en';

type TranslationsMap = {
  [key in Language]: {
    [key: string]: string;
  }
};

export const translations: TranslationsMap = {
  uz: {
    // Sidebar
    "Asosiy": "Asosiy",
    "Dars Rejasi": "Dars Rejasi",
    "Testlar": "Testlar",
    "Tekshirish": "Tekshirish",
    "Hisobot": "Hisobot",
    "Sozlanmalar": "Sozlanmalar",
    "PRO TARIF": "PRO TARIF",
    
    // Settings Page
    "settings_title": "Sozlanmalar",
    "settings_desc": "Dastur ko'rinishi, til va profilingizni moslashtiring",
    "theme_title": "Dastur Mavzusi",
    "theme_desc": "Ko'zingizga qulay bo'lgan rejimni tanlang",
    "theme_light": "Yorug'",
    "theme_dark": "Tungi",
    "lang_title": "Dastur Tili",
    "lang_desc": "O'zingizga qulay tilni tanlang",
    "profile_title": "Foydalanuvchi Profili",
    "profile_desc": "Ismingizni o'zgartiring",
    "profile_name_label": "Ism-sharifingiz",
    "save_btn": "Saqlash",
    "saved_msg": "Sozlanmalar muvaffaqiyatli saqlandi!",
  },
  ru: {
    // Sidebar
    "Asosiy": "Главная",
    "Dars Rejasi": "План урока",
    "Testlar": "Тесты",
    "Tekshirish": "Проверка",
    "Hisobot": "Отчет",
    "Sozlanmalar": "Настройки",
    "PRO TARIF": "ПРО ТАРИФ",
    
    // Settings Page
    "settings_title": "Настройки",
    "settings_desc": "Настройте внешний вид, язык и профиль",
    "theme_title": "Тема приложения",
    "theme_desc": "Выберите удобный для глаз режим",
    "theme_light": "Светлая",
    "theme_dark": "Темная",
    "lang_title": "Язык приложения",
    "lang_desc": "Выберите удобный язык",
    "profile_title": "Профиль пользователя",
    "profile_desc": "Измените свое имя",
    "profile_name_label": "Ваше имя и фамилия",
    "save_btn": "Сохранить",
    "saved_msg": "Настройки успешно сохранены!",
  },
  en: {
    // Sidebar
    "Asosiy": "Dashboard",
    "Dars Rejasi": "Lesson Plan",
    "Testlar": "Tests",
    "Tekshirish": "Grader",
    "Hisobot": "Report",
    "Sozlanmalar": "Settings",
    "PRO TARIF": "PRO PLAN",
    
    // Settings Page
    "settings_title": "Settings",
    "settings_desc": "Customize app appearance, language and profile",
    "theme_title": "App Theme",
    "theme_desc": "Choose a comfortable mode for your eyes",
    "theme_light": "Light",
    "theme_dark": "Dark",
    "lang_title": "App Language",
    "lang_desc": "Select your preferred language",
    "profile_title": "User Profile",
    "profile_desc": "Change your display name",
    "profile_name_label": "Full Name",
    "save_btn": "Save",
    "saved_msg": "Settings saved successfully!",
  }
};
