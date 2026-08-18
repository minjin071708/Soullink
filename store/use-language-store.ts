import {
  PREFERRED_LANGUAGE_CODES,
  type PreferredLanguageCode,
} from "@/schemas/authSchema";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Language = PreferredLanguageCode;
export type I18nLanguage = "en" | "mn" | "ko";

export function normalizeLanguage(
  value: string | null | undefined
): Language | null {
  const code = (value ?? "").trim().toUpperCase();
  return PREFERRED_LANGUAGE_CODES.includes(code as Language)
    ? (code as Language)
    : null;
}

export function toI18nLanguage(language: Language): I18nLanguage {
  return language.toLowerCase() as I18nLanguage;
}

type AppStore = {
  language: Language | null;
  hasCompletedOnboarding: boolean;
  isLoggedIn: boolean;
  hasHydrated: boolean;

  setLanguage: (language: Language) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  setLoggedIn: (isLoggedIn: boolean) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      language: null,
      hasCompletedOnboarding: false,
      isLoggedIn: false,
      hasHydrated: false,

      setLanguage: (language) => {
        const normalized = normalizeLanguage(language);
        if (normalized) {
          set({ language: normalized });
        }
      },

      completeOnboarding: () => {
        set({ hasCompletedOnboarding: true });
      },

      resetOnboarding: () => {
        set({
          language: null,
          hasCompletedOnboarding: false,
        });
      },

      setLoggedIn: (isLoggedIn: boolean) => {
        set({ isLoggedIn });
      },

      setHasHydrated: (hasHydrated: boolean) => {
        set({ hasHydrated });
      },
    }),
    {
      name: "soulink-app-settings",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        language: state.language,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        isLoggedIn: state.isLoggedIn,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.language = normalizeLanguage(state.language);
        }
        state?.setHasHydrated(true);
      },
    }
  )
);
