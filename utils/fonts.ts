import type { Language } from "@/store/use-language-store";

export type FontWeight = "regular" | "medium" | "semibold" | "bold";

const INTER_FONTS = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
} as const satisfies Record<FontWeight, string>;

const PRETENDARD_FONTS = {
  regular: "Pretendard-Regular",
  medium: "Pretendard-Medium",
  semibold: "Pretendard-SemiBold",
  bold: "Pretendard-Bold",
} as const satisfies Record<FontWeight, string>;

/**
 * Locale-based font family names for `Text` `fontFamily`.
 * ko → Pretendard, mn/en → Inter.
 */
export function getFontFamily(
  language: Language | null | undefined,
  weight: FontWeight = "regular"
): string {
  if (language === "ko") {
    return PRETENDARD_FONTS[weight];
  }

  return INTER_FONTS[weight];
}
