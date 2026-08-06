import { transcribeVoiceApi } from "@/api/voiceApi";
import type { VoiceAudioUpload } from "@/schemas/voiceSchema";
import { useMutation } from "@tanstack/react-query";

export const useTranscribeVoice = () => {
  return useMutation({
    mutationFn: (input: {
      audio: VoiceAudioUpload;
      fileSizeBytes?: number;
    }) => transcribeVoiceApi(input.audio, input.fileSizeBytes),
  });
};
