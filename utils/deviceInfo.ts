import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import type { DeviceType } from "@/types/authType";

const DEVICE_ID_KEY = "soullink_device_id";

export function getDeviceType(): DeviceType {
  return Platform.OS === "ios" ? "IOS" : "ANDROID";
}

/** App-install scoped ID for refresh-token device binding (max 200 chars). */
export async function getDeviceId(): Promise<string> {
  const existing = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  if (existing) {
    return existing.slice(0, 200);
  }

  const created = Crypto.randomUUID();
  await SecureStore.setItemAsync(DEVICE_ID_KEY, created);
  return created;
}

export async function getDeviceMeta(): Promise<{
  deviceId: string;
  deviceType: DeviceType;
}> {
  const [deviceId, deviceType] = await Promise.all([
    getDeviceId(),
    Promise.resolve(getDeviceType()),
  ]);

  return { deviceId, deviceType };
}
