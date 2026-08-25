import axiosInstance from "./axiosInstance";
import {
  pushDeviceRegistrationRequestSchema,
  pushDeviceRegistrationResponseSchema,
  type PushDeviceRegistrationData,
  type PushDeviceRegistrationRequest,
} from "@/schemas/pushNotificationSchema";

export async function registerPushDeviceApi(
  request: PushDeviceRegistrationRequest
): Promise<PushDeviceRegistrationData> {
  const payload = pushDeviceRegistrationRequestSchema.parse(request);

  const response = await axiosInstance.put(
    "/api/v1/members/me/push-tokens",
    payload
  );

  return pushDeviceRegistrationResponseSchema.parse(response.data).data;
}

export async function deactivatePushDeviceApi(deviceId: string) {
  const response = await axiosInstance.delete(
    `/api/v1/members/me/push-tokens/${deviceId}`
  );

  return response.data;
}
