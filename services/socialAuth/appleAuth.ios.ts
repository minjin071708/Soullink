import * as AppleAuthentication from "expo-apple-authentication";
import { createAppleNoncePair } from "@/utils/appleNonce";
import { SocialAuthCancelledError } from "./errors";

export type AppleCredential = {
  provider: "APPLE";
  idToken: string;
  /** Raw nonce (not hashed). Send to SoulLink; never log or persist. */
  nonce: string;
  displayName: string | null;
};

function buildDisplayName(
  fullName: AppleAuthentication.AppleAuthenticationFullName | null
): string | null {
  if (!fullName) {
    return null;
  }

  const parts = [fullName.givenName, fullName.middleName, fullName.familyName]
    .map((part) => part?.trim())
    .filter((part): part is string => !!part && part.length > 0);

  if (parts.length === 0) {
    return null;
  }

  return parts.join(" ");
}

export async function isAppleAuthAvailable(): Promise<boolean> {
  return AppleAuthentication.isAvailableAsync();
}

export async function signInWithApple(): Promise<AppleCredential> {
  const available = await AppleAuthentication.isAvailableAsync();
  if (!available) {
    throw new Error("Apple Sign-In is not available on this device");
  }

  const { rawNonce, hashedNonce } = await createAppleNoncePair();

  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });

    if (!credential.identityToken) {
      throw new Error("Apple Sign-In did not return an identity token");
    }

    return {
      provider: "APPLE",
      idToken: credential.identityToken,
      nonce: rawNonce,
      displayName: buildDisplayName(credential.fullName),
    };
  } catch (error) {
    const code =
      error && typeof error === "object" && "code" in error
        ? String((error as { code: unknown }).code)
        : "";

    if (code === "ERR_REQUEST_CANCELED") {
      throw new SocialAuthCancelledError();
    }

    throw error;
  }
}
