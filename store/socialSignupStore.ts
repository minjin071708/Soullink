/**
 * In-memory only. Do not write socialSignupToken to SecureStore, AsyncStorage, or logs.
 */
export type SocialSignupPending = {
  socialSignupToken: string;
  suggestedNickname: string | null;
  expiresAt: number;
};

let pending: SocialSignupPending | null = null;

export function setSocialSignupPending(input: {
  socialSignupToken: string;
  suggestedNickname?: string | null;
  expiresInSeconds?: number;
}): void {
  const expiresInSeconds = input.expiresInSeconds ?? 600;
  pending = {
    socialSignupToken: input.socialSignupToken,
    suggestedNickname: input.suggestedNickname ?? null,
    expiresAt: Date.now() + expiresInSeconds * 1000,
  };
}

export function getSocialSignupPending(): SocialSignupPending | null {
  if (!pending) {
    return null;
  }

  if (Date.now() >= pending.expiresAt) {
    pending = null;
    return null;
  }

  return pending;
}

export function clearSocialSignupPending(): void {
  pending = null;
}
