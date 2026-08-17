export type Language = 'uz' | 'ru' | 'en';

type TranslationsMap = {
  [key in Language]: {
    [key: string]: string;
  }
};

export const translations: TranslationsMap = {
  uz: {
    // Tab bar
    "Asosiy": "Asosiy",
    "Sinflar": "Sinflar",
    "Tekshirish": "Tekshirish",
    "Dars Rejasi": "Dars rejasi",
    "Ko'proq": "Ko'proq",

    // More screen destinations
    "Testlar": "Testlar",
    "Hisobot": "Hisobot",
    "Sozlanmalar": "Sozlanmalar",

    // Settings Page
    "settings_title": "Sozlanmalar",
    "settings_desc": "Profilingiz, til va bildirishnomalarni moslashtiring",
    "lang_title": "Dastur tili",
    "lang_desc": "O'zingizga qulay tilni tanlang",
    "profile_title": "Foydalanuvchi profili",
    "profile_desc": "Ismingizni o'zgartiring",
    "profile_name_label": "Ism-sharifingiz",
    "notifications_title": "Bildirishnomalar",
    "notifications_desc": "Xabarnomalarni yoqish yoki o'chirish",
    "notifications_enable": "Bildirishnomalar panelini o'chirish",
    "notifications_enable_desc": "Asosiy sahifadagi xabarnomalar panelini ko'rsatmaslik",
    "save_btn": "Saqlash",
    "saved_msg": "Sozlanmalar muvaffaqiyatli saqlandi!",
  },
  ru: {
    "Asosiy": "Главная",
    "Sinflar": "Классы",
    "Tekshirish": "Проверка",
    "Dars Rejasi": "План урока",
    "Ko'proq": "Ещё",

    "Testlar": "Тесты",
    "Hisobot": "Отчет",
    "Sozlanmalar": "Настройки",

    "settings_title": "Настройки",
    "settings_desc": "Настройте профиль, язык и уведомления",
    "lang_title": "Язык приложения",
    "lang_desc": "Выберите удобный язык",
    "profile_title": "Профиль пользователя",
    "profile_desc": "Измените свое имя",
    "profile_name_label": "Ваше имя и фамилия",
    "notifications_title": "Уведомления",
    "notifications_desc": "Включить или выключить уведомления",
    "notifications_enable": "Отключить панель уведомлений",
    "notifications_enable_desc": "Скрыть панель уведомлений на главной странице",
    "save_btn": "Сохранить",
    "saved_msg": "Настройки успешно сохранены!",
  },
  en: {
    "Asosiy": "Home",
    "Sinflar": "Classes",
    "Tekshirish": "Grader",
    "Dars Rejasi": "Lesson plan",
    "Ko'proq": "More",

    "Testlar": "Tests",
    "Hisobot": "Report",
    "Sozlanmalar": "Settings",

    "settings_title": "Settings",
    "settings_desc": "Customize your profile, language and notifications",
    "lang_title": "App language",
    "lang_desc": "Select your preferred language",
    "profile_title": "User profile",
    "profile_desc": "Change your display name",
    "profile_name_label": "Full name",
    "notifications_title": "Notifications",
    "notifications_desc": "Enable or disable notifications",
    "notifications_enable": "Disable notifications panel",
    "notifications_enable_desc": "Hide the notifications panel from the dashboard",
    "save_btn": "Save",
    "saved_msg": "Settings saved successfully!",
  }
};
