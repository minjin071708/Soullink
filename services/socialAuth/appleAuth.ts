/**
 * Android/web stub — do not import `expo-apple-authentication` here.
 * That package is iOS-only and breaks the Android Metro bundle.
 */
export type AppleCredential = {
  provider: "APPLE";
  idToken: string;
  nonce: string;
  displayName: string | null;
};

export async function isAppleAuthAvailable(): Promise<boolean> {
  return false;
}

export async function signInWithApple(): Promise<AppleCredential> {
  throw new Error("Apple Sign-In is only available on iOS");
}
