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

/**
 * In-memory only. Marks a newly created social member who still needs
 * nickname (required) + optional photo setup before landing on Home.
 */
let socialProfileSetupRequired = false;
let suggestedProfileNickname: string | null = null;

export function markSocialProfileSetupRequired(
  nickname?: string | null
): void {
  socialProfileSetupRequired = true;
  suggestedProfileNickname = nickname?.trim() ? nickname.trim() : null;
}

export function isSocialProfileSetupRequired(): boolean {
  return socialProfileSetupRequired;
}

export function getSuggestedSocialProfileNickname(): string | null {
  return suggestedProfileNickname;
}

export function clearSocialProfileSetupRequired(): void {
  socialProfileSetupRequired = false;
  suggestedProfileNickname = null;
}
