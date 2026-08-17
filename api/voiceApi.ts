import i18n from "@/i18n";
import {
  voiceTranscribeResponseSchema,
  type VoiceAcceptLanguage,
  type VoiceAudioUpload,
  type VoiceTranscribeResponse,
} from "@/schemas/voiceSchema";
import axiosInstance from "./axiosInstance";

const MAX_AUDIO_BYTES = 3 * 1024 * 1024;

export class VoiceFileTooLargeError extends Error {
  constructor() {
    super("Audio file exceeds the 3MB limit");
    this.name = "VoiceFileTooLargeError";
  }
}

function resolveVoiceAcceptLanguage(): VoiceAcceptLanguage {
  const language = (i18n.resolvedLanguage ?? i18n.language ?? "mn")
    .toLowerCase()
    .split("-")[0];

  if (language === "en" || language === "ko" || language === "mn") {
    return language;
  }

  return "mn";
}

/**
 * POST /api/v1/voice/transcribe?punctuate=true
 * multipart/form-data field: `audio` (max 3MB)
 * Accept-Language: current UI language (ko | en | mn).
 * Server routes mn → Duudlaga, ko/en → OpenAI.
 * Do not set Content-Type manually — axiosInstance strips it for FormData.
 */
export const transcribeVoiceApi = async (
  audio: VoiceAudioUpload,
  fileSizeBytes?: number
): Promise<VoiceTranscribeResponse> => {
  if (
    typeof fileSizeBytes === "number" &&
    fileSizeBytes > MAX_AUDIO_BYTES
  ) {
    throw new VoiceFileTooLargeError();
  }

  const formData = new FormData();
  // Filename is not business data on the server; keep a stable local name.
  formData.append("audio", {
    uri: audio.uri,
    name: audio.name,
    type: audio.mimeType,
  } as unknown as Blob);

  const response = await axiosInstance.post(
    "api/v1/voice/transcribe?punctuate=true",
    formData,
    {
      timeout: 60_000,
      headers: {
        "Accept-Language": resolveVoiceAcceptLanguage(),
      },
    }
  );

  return voiceTranscribeResponseSchema.parse(response.data);
};

export { MAX_AUDIO_BYTES, resolveVoiceAcceptLanguage };
