import type { Language } from "@/store/use-language-store";
import type { AxiosError } from "axios";

type ApiErrorBody = {
  code?: string;
  message?: string;
};

export function getAuthErrorCode(error: unknown): string | null {
  const axiosError = error as AxiosError<ApiErrorBody>;
  return axiosError.response?.data?.code ?? null;
}

export function getAuthErrorMessage(
  error: unknown,
  fallback: string
): string {
  const axiosError = error as AxiosError<ApiErrorBody>;
  return axiosError.response?.data?.message ?? fallback;
}

export function mapSocialAuthErrorMessage(
  error: unknown,
  language: Language = "MN"
): string {
  const code = getAuthErrorCode(error);
  const messages = {
    EN: {
      TERMS_AGREEMENT_REQUIRED:
        "Please agree to the required terms to continue.",
      SOCIAL_TOKEN_INVALID:
        "Social authentication expired. Please try again.",
      SOCIAL_SIGNUP_TOKEN_INVALID:
        "Signup session expired. Please sign in with Google or Apple again.",
      SOCIAL_ACCOUNT_LINK_REQUIRED:
        "An account with this email already exists. Please sign in with email first.",
      SOCIAL_SIGNUP_ALREADY_COMPLETED:
        "Signup already completed. Please sign in again.",
      ACCOUNT_LOCKED:
        "This account is locked. Please contact support.",
      fallback: "Social sign-in failed. Please try again.",
    },
    MN: {
      TERMS_AGREEMENT_REQUIRED: "Үргэлжлүүлэхийн тулд шаардлагатай нөхцөлийг зөвшөөрнө үү.",
      SOCIAL_TOKEN_INVALID:
        "Сошиал нэвтрэлт хүчингүй болсон. Дахин оролдоно уу.",
      SOCIAL_SIGNUP_TOKEN_INVALID:
        "Бүртгэлийн хугацаа дууссан. Google эсвэл Apple-р дахин нэвтэрнэ үү.",
      SOCIAL_ACCOUNT_LINK_REQUIRED:
        "Энэ имэйлтэй бүртгэл аль хэдийн байна. Эхлээд имэйлээр нэвтэрнэ үү.",
      SOCIAL_SIGNUP_ALREADY_COMPLETED:
        "Бүртгэл аль хэдийн дууссан. Дахин нэвтэрнэ үү.",
      ACCOUNT_LOCKED: "Энэ бүртгэл түгжигдсэн байна.",
      fallback: "Сошиал нэвтрэлт амжилтгүй. Дахин оролдоно уу.",
    },
    KO: {
      TERMS_AGREEMENT_REQUIRED: "필수 약관에 동의해 주세요.",
      SOCIAL_TOKEN_INVALID:
        "소셜 인증이 만료되었습니다. 다시 시도해 주세요.",
      SOCIAL_SIGNUP_TOKEN_INVALID:
        "가입 세션이 만료되었습니다. Google 또는 Apple로 다시 로그인해 주세요.",
      SOCIAL_ACCOUNT_LINK_REQUIRED:
        "같은 이메일의 계정이 이미 있습니다. 이메일로 먼저 로그인해 주세요.",
      SOCIAL_SIGNUP_ALREADY_COMPLETED:
        "이미 가입이 완료되었습니다. 다시 로그인해 주세요.",
      ACCOUNT_LOCKED: "계정이 잠겨 있습니다. 고객센터에 문의해 주세요.",
      fallback: "소셜 로그인에 실패했습니다. 다시 시도해 주세요.",
    },
  } as const;

  const table = messages[language];
  if (code && code in table) {
    return table[code as keyof typeof table];
  }

  const axiosError = error as AxiosError<ApiErrorBody>;
  const apiMessage = axiosError.response?.data?.message;
  if (apiMessage) {
    return apiMessage;
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return table.fallback;
}
