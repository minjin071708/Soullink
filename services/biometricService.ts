import * as LocalAuthentication from "expo-local-authentication";
import { Platform } from "react-native";

export type BiometricCapability = {
  isAvailable: boolean;
  hasHardware: boolean;
  isEnrolled: boolean;
};

export async function getBiometricCapability(): Promise<BiometricCapability> {
  try {
    if (Platform.OS === "web") {
      return { isAvailable: false, hasHardware: false, isEnrolled: false };
    }

    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = hasHardware
      ? await LocalAuthentication.isEnrolledAsync()
      : false;

    return {
      hasHardware,
      isEnrolled,
      isAvailable: hasHardware && isEnrolled,
    };
  } catch {
    return { isAvailable: false, hasHardware: false, isEnrolled: false };
  }
}

export type BiometricPromptResult =
  | { success: true }
  | { success: false; reason: "cancel" | "fail" | "unavailable" };

export async function promptBiometricUnlock(
  promptMessage = "Unlock SoulLink"
): Promise<BiometricPromptResult> {
  try {
    const capability = await getBiometricCapability();
    if (!capability.isAvailable) {
      return { success: false, reason: "unavailable" };
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: "Cancel",
      disableDeviceFallback: true,
    });

    if (result.success) {
      return { success: true };
    }

    const canceled =
      result.error === "user_cancel" ||
      result.error === "system_cancel" ||
      result.error === "app_cancel";

    return { success: false, reason: canceled ? "cancel" : "fail" };
  } catch {
    return { success: false, reason: "fail" };
  }
}
