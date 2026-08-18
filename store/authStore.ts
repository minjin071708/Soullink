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
  /** In-memory access token mirror of SecureStore. Not persisted. */
  accessToken: string | null;
  status: AuthStatus;
  hasCompletedBootstrap: boolean;

  setMember: (member: MemberType) => void;
  setAuthenticated: (value?: boolean) => void;
  setAccessToken: (accessToken: string | null) => void;
  setStatus: (status: AuthStatus) => void;
  setHasCompletedBootstrap: (value: boolean) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthStoreType>((set) => ({
  member: null,
  isAuthenticated: false,
  accessToken: null,
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

  setAccessToken: (accessToken) => set({ accessToken }),

  setStatus: (status) => set({ status }),

  setHasCompletedBootstrap: (value) =>
    set({ hasCompletedBootstrap: value }),

  clearAuth: () =>
    set({
      member: null,
      isAuthenticated: false,
      accessToken: null,
      status: "unauthenticated",
    }),
}));
