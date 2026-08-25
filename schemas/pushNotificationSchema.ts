import { z } from "zod";

export const pushDeviceTypeSchema = z.enum(["ANDROID", "IOS"]);

export const pushDeviceRegistrationRequestSchema = z.object({
  pushToken: z.string().trim().min(1).max(512),
  deviceId: z.string().trim().min(1).max(200),
  deviceType: pushDeviceTypeSchema,
});

export const pushDeviceRegistrationDataSchema = z.object({
  deviceId: z.string().trim().min(1).max(200),
  deviceType: pushDeviceTypeSchema,
  isActive: z.boolean(),
});

export const pushDeviceRegistrationResponseSchema = z.object({
  success: z.boolean(),
  code: z.string(),
  message: z.string(),
  data: pushDeviceRegistrationDataSchema,
});

export type PushDeviceType = z.infer<typeof pushDeviceTypeSchema>;

export type PushDeviceRegistrationRequest = z.infer<
  typeof pushDeviceRegistrationRequestSchema
>;

export type PushDeviceRegistrationData = z.infer<
  typeof pushDeviceRegistrationDataSchema
>;

export type PushDeviceRegistrationResponse = z.infer<
  typeof pushDeviceRegistrationResponseSchema
>;
