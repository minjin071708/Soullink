import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "@/locales/en.json";
import ko from "@/locales/ko.json";
import mn from "@/locales/mn.json";

const resources = {
  en: { translation: en },
  mn: { translation: mn },
  ko: { translation: ko },
} as const;

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources,
    lng: "mn",
    fallbackLng: "en",
    compatibilityJSON: "v4",
    interpolation: {
      escapeValue: false,
    },
  });
}

export default i18n;
