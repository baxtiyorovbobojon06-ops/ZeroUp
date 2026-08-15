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
    "system_settings": "Tizim Sozlanmalari",
    "profile_settings": "Profil Sozlanmalari",
    "theme_title": "Dastur Mavzusi",
    "theme_desc": "Ko'zingizga qulay bo'lgan rejimni tanlang",
    "theme_light": "Yorug'",
    "theme_dark": "Tungi",
    "lang_title": "Dastur Tili",
    "lang_desc": "O'zingizga qulay tilni tanlang",
    "font_size_title": "Shrift O'lchami",
    "font_size_desc": "Matnlar o'lchamini tanlang",
    "size_sm": "Kichik",
    "size_base": "O'rtacha",
    "size_lg": "Katta",
    "font_family_title": "Shrift Turi",
    "font_family_desc": "Dastur yozuvlari stilini tanlang",
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
    "system_settings": "Системные настройки",
    "profile_settings": "Настройки профиля",
    "theme_title": "Тема приложения",
    "theme_desc": "Выберите удобный для глаз режим",
    "theme_light": "Светлая",
    "theme_dark": "Темная",
    "lang_title": "Язык приложения",
    "lang_desc": "Выберите удобный язык",
    "font_size_title": "Размер шрифта",
    "font_size_desc": "Выберите размер текста",
    "size_sm": "Мелкий",
    "size_base": "Средний",
    "size_lg": "Крупный",
    "font_family_title": "Тип шрифта",
    "font_family_desc": "Выберите стиль текста приложения",
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
    "system_settings": "System Settings",
    "profile_settings": "Profile Settings",
    "theme_title": "App Theme",
    "theme_desc": "Choose a comfortable mode for your eyes",
    "theme_light": "Light",
    "theme_dark": "Dark",
    "lang_title": "App Language",
    "lang_desc": "Select your preferred language",
    "font_size_title": "Font Size",
    "font_size_desc": "Select text size",
    "size_sm": "Small",
    "size_base": "Medium",
    "size_lg": "Large",
    "font_family_title": "Font Family",
    "font_family_desc": "Choose the application text style",
    "profile_title": "User Profile",
    "profile_desc": "Change your display name",
    "profile_name_label": "Full Name",
    "save_btn": "Save",
    "saved_msg": "Settings saved successfully!",
  }
};
