import {
  pushDeviceDeactivationResponseSchema,
  pushDeviceRegistrationRequestSchema,
  pushDeviceRegistrationResponseSchema,
  type PushDeviceDeactivationData,
  type PushDeviceRegistrationData,
  type PushDeviceRegistrationRequest,
} from "@/schemas/pushNotificationSchema";
import axiosInstance from "./axiosInstance";

export async function registerPushDeviceApi(
  request: PushDeviceRegistrationRequest
): Promise<PushDeviceRegistrationData> {
  const payload = pushDeviceRegistrationRequestSchema.parse(request);

  const response = await axiosInstance.put(
    "api/v1/members/me/push-tokens",
    payload
  );

  return pushDeviceRegistrationResponseSchema.parse(response.data).data;
}

export async function deactivatePushDeviceApi(
  deviceId: string
): Promise<PushDeviceDeactivationData> {
  const normalizedDeviceId = deviceId.trim();
  if (normalizedDeviceId.length === 0 || normalizedDeviceId.length > 200) {
    throw new Error("A valid deviceId is required.");
  }

  const response = await axiosInstance.delete(
    `api/v1/members/me/push-tokens/${encodeURIComponent(normalizedDeviceId)}`
  );

  return pushDeviceDeactivationResponseSchema.parse(response.data).data;
}
