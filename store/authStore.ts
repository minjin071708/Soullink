import type { MemberType } from "@/types/authType";
import { create } from "zustand";

export type AuthStatus =
  | "bootstrapping"
  | "authenticated"
  | "unauthenticated"
  | "locked";

type AuthStoreType = {
  member: MemberType | null;
  isAuthenticated: boolean;
  status: AuthStatus;
  hasCompletedBootstrap: boolean;

  setMember: (member: MemberType) => void;
  setAuthenticated: (value?: boolean) => void;
  setStatus: (status: AuthStatus) => void;
  setHasCompletedBootstrap: (value: boolean) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthStoreType>((set) => ({
  member: null,
  isAuthenticated: false,
  status: "bootstrapping",
  hasCompletedBootstrap: false,

  setMember: (member) =>
    set({
      member,
      isAuthenticated: true,
      status: "authenticated",
    }),

  setAuthenticated: (value = true) =>
    set({
      isAuthenticated: value,
      status: value ? "authenticated" : "unauthenticated",
    }),

  setStatus: (status) => set({ status }),

  setHasCompletedBootstrap: (value) =>
    set({ hasCompletedBootstrap: value }),

  clearAuth: () =>
    set({
      member: null,
      isAuthenticated: false,
      status: "unauthenticated",
    }),
}));
