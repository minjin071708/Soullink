import {
  MAX_AUDIO_BYTES,
  VoiceFileTooLargeError,
} from "@/api/voiceApi";
import { useTranscribeVoice } from "@/hooks/useTranscribeVoice";
import {
  VOICE_ERROR_CODES,
  type VoiceAudioUpload,
} from "@/schemas/voiceSchema";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { Audio as ExpoAvAudio } from "expo-av";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { requireOptionalNativeModule } from "expo-modules-core";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { AxiosError } from "axios";

const PRIMARY = "#8A6BE8";

type AudioModule = typeof ExpoAvAudio;

/**
 * expo-av needs a native rebuild. Loading it while ExponentAV is missing
 * crashes the screen, so only require when the native module exists.
 */
function loadAudioModule(): AudioModule | null {
  if (!requireOptionalNativeModule("ExponentAV")) {
    return null;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("expo-av").Audio as AudioModule;
  } catch {
    return null;
  }
}

const Audio = loadAudioModule();

type VoiceJournalPanelProps = {
  textColor: string;
  mutedColor: string;
  inputBackground: string;
  borderColor: string;
  onTranscribed: (transcription: string) => void;
  onError: (message: string, requestId?: string) => void;
};

function guessMimeType(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".wav")) return "audio/wav";
  if (lower.endsWith(".mp3")) return "audio/mpeg";
  if (lower.endsWith(".m4a") || lower.endsWith(".mp4")) return "audio/mp4";
  if (lower.endsWith(".aac")) return "audio/aac";
  if (lower.endsWith(".caf")) return "audio/x-caf";
  if (lower.endsWith(".ogg")) return "audio/ogg";
  return "audio/mp4";
}

async function getFileSizeBytes(uri: string): Promise<number | undefined> {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists && typeof info.size === "number") {
      return info.size;
    }
  } catch {
    // Size check is best-effort; server still enforces 413.
  }
  return undefined;
}

export function VoiceJournalPanel({
  textColor,
  mutedColor,
  inputBackground,
  borderColor,
  onTranscribed,
  onError,
}: VoiceJournalPanelProps) {
  const { t } = useTranslation();
  const recordingRef = useRef<InstanceType<AudioModule["Recording"]> | null>(
    null
  );
  const [isRecording, setIsRecording] = useState(false);
  const { mutateAsync: transcribe, isPending: isTranscribing } =
    useTranscribeVoice();
  const canRecord = Audio !== null;

  useEffect(() => {
    return () => {
      const active = recordingRef.current;
      if (active) {
        void active.stopAndUnloadAsync().catch(() => undefined);
        recordingRef.current = null;
      }
    };
  }, []);

  const uploadAudio = async (audio: VoiceAudioUpload) => {
    try {
      const fileSizeBytes = await getFileSizeBytes(audio.uri);
      if (
        typeof fileSizeBytes === "number" &&
        fileSizeBytes > MAX_AUDIO_BYTES
      ) {
        throw new VoiceFileTooLargeError();
      }

      const response = await transcribe({ audio, fileSizeBytes });
      const text = response.data.transcription.trim();
      if (!text) {
        onError(t("journal.write.voiceEmptyTranscription"));
        return;
      }
      onTranscribed(text);
    } catch (error) {
      if (error instanceof VoiceFileTooLargeError) {
        onError(t("journal.write.voiceTooLarge"));
        return;
      }

      const axiosError = error as AxiosError<{
        code?: string;
        message?: string;
        requestId?: string;
      }>;
      const code = axiosError.response?.data?.code;
      const requestId = axiosError.response?.data?.requestId;
      const apiMessage = axiosError.response?.data?.message;

      if (code === VOICE_ERROR_CODES.AUDIO_TOO_LARGE) {
        onError(t("journal.write.voiceTooLarge"), requestId);
        return;
      }
      if (code === VOICE_ERROR_CODES.AUDIO_REQUIRED) {
        onError(t("journal.write.voiceAudioRequired"), requestId);
        return;
      }
      if (code === VOICE_ERROR_CODES.AUDIO_INVALID) {
        onError(t("journal.write.voiceAudioInvalid"), requestId);
        return;
      }
      if (code === VOICE_ERROR_CODES.CONFIGURATION_ERROR) {
        // Spec: do not encourage repeated retries for server config errors.
        onError(
          apiMessage?.trim() || t("journal.write.voiceConfigError"),
          requestId
        );
        return;
      }
      if (code === VOICE_ERROR_CODES.PROVIDER_ERROR) {
        onError(
          apiMessage?.trim() || t("journal.write.voiceProviderError"),
          requestId
        );
        return;
      }

      const message =
        apiMessage?.trim() ||
        (error instanceof Error
          ? error.message
          : t("journal.write.voiceTranscribeFailed"));
      onError(message, requestId);
    }
  };

  const startRecording = async () => {
    if (!Audio || isRecording || isTranscribing) {
      if (!Audio) {
        onError(t("journal.write.voiceNativeUnavailable"));
      }
      return;
    }

    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        onError(t("journal.write.voicePermissionDenied"));
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setIsRecording(true);
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : t("journal.write.voiceRecordFailed")
      );
    }
  };

  const stopRecordingAndTranscribe = async () => {
    if (!Audio) {
      return;
    }

    const recording = recordingRef.current;
    if (!recording) {
      return;
    }

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

      const uri = recording.getURI();
      recordingRef.current = null;

      if (!uri) {
        onError(t("journal.write.voiceRecordFailed"));
        return;
      }

      await uploadAudio({
        uri,
        name: `journal-voice-${Date.now()}.m4a`,
        mimeType: "audio/mp4",
      });
    } catch (error) {
      recordingRef.current = null;
      setIsRecording(false);
      onError(
        error instanceof Error
          ? error.message
          : t("journal.write.voiceRecordFailed")
      );
    }
  };

  const pickAudioFile = async () => {
    if (isRecording || isTranscribing) {
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["audio/*"],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      const asset = result.assets[0];
      const name = asset.name || `picked-audio-${Date.now()}.m4a`;
      await uploadAudio({
        uri: asset.uri,
        name,
        mimeType: asset.mimeType || guessMimeType(name),
      });
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : t("journal.write.voicePickFailed")
      );
    }
  };

  const busy = isRecording || isTranscribing;

  return (
    <View
      style={[
        styles.panel,
        { backgroundColor: inputBackground, borderColor },
      ]}
    >
      <Ionicons
        name={isRecording ? "radio-button-on" : "mic-outline"}
        size={36}
        color={isRecording ? "#E0567A" : PRIMARY}
      />
      <Text style={[styles.title, { color: textColor }]}>
        {isTranscribing
          ? t("journal.write.voiceTranscribing")
          : isRecording
            ? t("journal.write.voiceRecording")
            : t("journal.write.voiceTitle")}
      </Text>
      <Text style={[styles.body, { color: mutedColor }]}>
        {canRecord
          ? t("journal.write.voiceBody")
          : t("journal.write.voiceNativeUnavailable")}
      </Text>

      {isTranscribing ? (
        <ActivityIndicator color={PRIMARY} style={styles.spinner} />
      ) : (
        <View style={styles.actions}>
          {canRecord ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                isRecording
                  ? t("journal.write.voiceStop")
                  : t("journal.write.voiceRecord")
              }
              disabled={busy && !isRecording}
              onPress={() => {
                if (isRecording) {
                  void stopRecordingAndTranscribe();
                } else {
                  void startRecording();
                }
              }}
              style={({ pressed }) => [
                styles.primaryButton,
                {
                  backgroundColor: isRecording ? "#E0567A" : PRIMARY,
                },
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name={isRecording ? "stop" : "mic"}
                size={18}
                color="#FFFFFF"
              />
              <Text style={styles.primaryButtonText}>
                {isRecording
                  ? t("journal.write.voiceStop")
                  : t("journal.write.voiceRecord")}
              </Text>
            </Pressable>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("journal.write.voicePick")}
            disabled={busy}
            onPress={() => {
              void pickAudioFile();
            }}
            style={({ pressed }) => [
              styles.secondaryButton,
              { borderColor },
              pressed && styles.pressed,
              busy && styles.disabled,
            ]}
          >
            <Ionicons name="folder-open-outline" size={18} color={textColor} />
            <Text style={[styles.secondaryButtonText, { color: textColor }]}>
              {t("journal.write.voicePick")}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    minHeight: 220,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 8,
  },
  spinner: {
    marginTop: 12,
  },
  actions: {
    width: "100%",
    gap: 10,
    marginTop: 8,
  },
  primaryButton: {
    minHeight: 48,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryButton: {
    minHeight: 48,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.88,
  },
  disabled: {
    opacity: 0.55,
  },
});
