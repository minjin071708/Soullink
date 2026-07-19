import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Language = "en" | "mn" | "ko";

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
        set({ language });
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

      setLoggedIn: (isLoggedIn) => {
        set({ isLoggedIn });
      },

      setHasHydrated: (hasHydrated) => {
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
        state?.setHasHydrated(true);
      },
    }
  )
);
