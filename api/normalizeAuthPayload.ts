import { memberSchema } from "@/schemas/authSchema";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function hasTokens(obj: Record<string, unknown> | null): boolean {
  return (
    !!obj &&
    typeof obj.accessToken === "string" &&
    typeof obj.refreshToken === "string"
  );
}

function parseMember(value: unknown) {
  const parsed = memberSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

/**
 * Normalize login/refresh API payloads.
 * Observed login shapes:
 * 1) tokens under top-level `member`, empty `data`
 * 2) tokens under `data`, optional partial `data.member`
 */
export function normalizeTokenPayload(
  raw: Record<string, unknown>
): Record<string, unknown> {
  const data = asRecord(raw.data) ?? {};
  const topMember = asRecord(raw.member);

  const tokenSource = hasTokens(data)
    ? data
    : hasTokens(topMember)
      ? topMember
      : null;

  if (!tokenSource) {
    return raw;
  }

  const nestedProfile = asRecord(data.member);
  const member =
    nestedProfile && !hasTokens(nestedProfile)
      ? parseMember(nestedProfile)
      : topMember && !hasTokens(topMember)
        ? parseMember(topMember)
        : null;

  return {
    success: raw.success,
    code: raw.code,
    message: raw.message,
    requestId: raw.requestId ?? "",
    data: {
      accessToken: tokenSource.accessToken,
      refreshToken: tokenSource.refreshToken,
      tokenType: tokenSource.tokenType ?? "Bearer",
      accessTokenExpiresIn: tokenSource.accessTokenExpiresIn,
      refreshTokenExpiresAt: tokenSource.refreshTokenExpiresAt,
      ...(member !== undefined ? { member } : {}),
    },
  };
}
