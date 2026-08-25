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
  active: z.boolean(),
});

export const pushDeviceRegistrationResponseSchema = z.object({
  success: z.boolean(),
  code: z.string(),
  message: z.string(),
  data: pushDeviceRegistrationDataSchema,
  requestId: z.string().optional().default(""),
});

export const pushDeviceDeactivationDataSchema = z.object({
  deviceId: z.string().trim().min(1).max(200),
  active: z.boolean(),
});

export const pushDeviceDeactivationResponseSchema = z.object({
  success: z.boolean(),
  code: z.string(),
  message: z.string(),
  data: pushDeviceDeactivationDataSchema,
  requestId: z.string().optional().default(""),
});

function isIsoDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5, 7));
  const day = Number(value.slice(8, 10));
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

/**
 * Expo notification `data` when daily AI analysis completes.
 * Backend must include the diary’s `emotionDate` (not `generatedAt`).
 *
 * {
 *   "type": "DAILY_ANALYSIS_READY",
 *   "diaryId": 24,
 *   "emotionDate": "2026-08-25"
 * }
 */
export const dailyAnalysisReadyPayloadSchema = z.object({
  type: z.literal("DAILY_ANALYSIS_READY"),
  diaryId: z.coerce.number().int().positive(),
  emotionDate: z.string().refine(isIsoDateString, {
    message: "emotionDate must use YYYY-MM-DD format",
  }),
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

export type PushDeviceDeactivationData = z.infer<
  typeof pushDeviceDeactivationDataSchema
>;

export type PushDeviceDeactivationResponse = z.infer<
  typeof pushDeviceDeactivationResponseSchema
>;

export type DailyAnalysisReadyPayload = z.infer<
  typeof dailyAnalysisReadyPayloadSchema
>;
