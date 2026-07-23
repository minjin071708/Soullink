import * as Crypto from "expo-crypto";

/**
 * Apple Sign In nonce pair.
 * - `rawNonce`: sent to SoulLink `/auth/social/login` (never log or persist)
 * - `hashedNonce`: SHA-256 hex, passed to AppleAuthentication.signInAsync
 */
export type AppleNoncePair = {
  rawNonce: string;
  hashedNonce: string;
};

export async function createAppleNoncePair(): Promise<AppleNoncePair> {
  const rawNonce = Crypto.randomUUID().replace(/-/g, "") + Crypto.randomUUID().replace(/-/g, "");
  const hashedNonce = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    rawNonce
  );

  return { rawNonce, hashedNonce };
}
