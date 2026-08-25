import type {
  PushDeviceRegistrationRequest,
  PushDeviceType,
} from "@/schemas/pushNotificationSchema";
import { getOrCreateInstallationId } from "@/utils/deviceInstallation";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

async function configureAndroidNotificationChannel() {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync("default", {
    name: "SoulCity notifications",
    description: "AI analysis and important service notifications",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#7388F2",
    sound: "default",
  });
}

/**
 * granted: return true without prompting again
 * denied: return false without opening the OS dialog
 * undetermined: request OS permission, then return whether granted
 */
async function requestNotificationPermission() {
  const currentPermission = await Notifications.getPermissionsAsync();

  if (currentPermission.status === "granted") {
    return true;
  }

  if (currentPermission.status === "denied") {
    return false;
  }

  const requestedPermission = await Notifications.requestPermissionsAsync();

  return requestedPermission.status === "granted";
}

function getEasProjectId() {
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  if (!projectId) {
    throw new Error(
      "EAS projectId is missing. Run `eas init` and rebuild the app."
    );
  }

  return projectId;
}

function getDeviceType(): PushDeviceType {
  return Platform.OS === "ios" ? "IOS" : "ANDROID";
}

export async function createPushDeviceRegistration(): Promise<PushDeviceRegistrationRequest | null> {
  if (!Device.isDevice) {
    console.warn("Push notification requires a physical device.");

    return null;
  }

  await configureAndroidNotificationChannel();

  const permissionGranted = await requestNotificationPermission();

  if (!permissionGranted) {
    return null;
  }

  const projectId = getEasProjectId();

  const [tokenResponse, deviceId] = await Promise.all([
    Notifications.getExpoPushTokenAsync({
      projectId,
    }),
    getOrCreateInstallationId(),
  ]);

  return {
    pushToken: tokenResponse.data,
    deviceId,
    deviceType: getDeviceType(),
  };
}
