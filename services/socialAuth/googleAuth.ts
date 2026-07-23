import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { Platform } from "react-native";
import { SocialAuthCancelledError, SocialAuthConfigError } from "./errors";

export type GoogleCredential = {
  provider: "GOOGLE";
  idToken: string;
  nonce: null;
  displayName: string | null;
};

let configured = false;

function requireWebClientId(): string {
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();

  if (!webClientId) {
    throw new SocialAuthConfigError(
      "Missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID. Use the Web application OAuth client ID (not the Android client ID)."
    );
  }

  return webClientId;
}

/**
 * Configure once at module level / first use — not inside the button press path repeatedly.
 */
function ensureGoogleConfigured(): void {
  if (configured) {
    return;
  }

  GoogleSignin.configure({
    webClientId: requireWebClientId(),
    offlineAccess: false,
  });

  configured = true;
}

export async function signInWithGoogle(): Promise<GoogleCredential> {
  ensureGoogleConfigured();

  try {
    if (Platform.OS === "android") {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
    }

    const response = await GoogleSignin.signIn();

    if (response.type === "cancelled") {
      throw new SocialAuthCancelledError();
    }

    let idToken = response.data.idToken;
    const displayName = response.data.user.name;

    if (!idToken) {
      const tokens = await GoogleSignin.getTokens();
      idToken = tokens.idToken;
    }

    if (!idToken) {
      throw new Error("Google Sign-In did not return an ID token");
    }

    return {
      provider: "GOOGLE",
      idToken,
      nonce: null,
      displayName,
    };
  } catch (error) {
    if (error instanceof SocialAuthCancelledError) {
      throw error;
    }

    if (isErrorWithCode(error)) {
      if (
        error.code === statusCodes.SIGN_IN_CANCELLED ||
        error.code === statusCodes.IN_PROGRESS
      ) {
        throw new SocialAuthCancelledError();
      }

      if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error(
          "Google Play Services is not available or outdated on this device."
        );
      }
    }

    throw error;
  }
}
