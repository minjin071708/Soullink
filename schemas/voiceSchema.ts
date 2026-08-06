import { z } from "zod";

/** UI / Accept-Language values for voice STT. */
export const voiceAcceptLanguageSchema = z.enum(["en", "ko", "mn"]);
export type VoiceAcceptLanguage = z.infer<typeof voiceAcceptLanguageSchema>;

/** POST /api/v1/voice/transcribe */
export const voiceTranscribeDataSchema = z.object({
  transcription: z.string(),
  languageCode: z.string().optional().default(""),
});

export const voiceTranscribeResponseSchema = z.object({
  success: z.boolean(),
  code: z.string(),
  message: z.string(),
  data: voiceTranscribeDataSchema,
  requestId: z.string().optional().default(""),
});

export type VoiceTranscribeResponse = z.infer<
  typeof voiceTranscribeResponseSchema
>;

export type VoiceAudioUpload = {
  uri: string;
  name: string;
  mimeType: string;
};

/** Known API error codes from voice transcribe. */
export const VOICE_ERROR_CODES = {
  AUDIO_REQUIRED: "VOICE_AUDIO_REQUIRED",
  AUDIO_INVALID: "VOICE_AUDIO_INVALID",
  UNAUTHORIZED: "UNAUTHORIZED",
  AUDIO_TOO_LARGE: "VOICE_AUDIO_TOO_LARGE",
  PROVIDER_ERROR: "VOICE_PROVIDER_ERROR",
  CONFIGURATION_ERROR: "VOICE_CONFIGURATION_ERROR",
} as const;
