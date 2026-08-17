import {
  MAX_AUDIO_BYTES,
  VoiceFileTooLargeError,
} from "@/api/voiceApi";
import { AudioLevelMeter } from "@/components/journal/AudioLevelMeter";
import { VoiceOrb } from "@/components/journal/VoiceOrb";
import { useTranscribeVoice } from "@/hooks/useTranscribeVoice";
import {
  VOICE_ERROR_CODES,
  type VoiceAudioUpload,
} from "@/schemas/voiceSchema";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { AxiosError } from "axios";
import * as DocumentPicker from "expo-document-picker";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import * as FileSystem from "expo-file-system/legacy";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const PRIMARY = "#8A6BE8";
const RECORDING_OPTIONS = {
  ...RecordingPresets.HIGH_QUALITY,
  isMeteringEnabled: true,
};

type VoiceJournalPanelProps = {
  textColor: string;
  mutedColor: string;
  inputBackground: string;
  borderColor: string;
  onTranscribed: (transcription: string) => void;
  onError: (message: string, requestId?: string) => void;
  onDismiss?: () => void;
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

function normalizeMetering(value: number | undefined): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0;
  }

  // Metering is dB: -60 dB ≈ silence, 0 dB ≈ peak.
  return Math.max(0, Math.min(1, (value + 60) / 60));
}

function formatDuration(durationMillis: number): string {
  const totalSeconds = Math.floor(Math.max(0, durationMillis) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function VoiceJournalPanel({
  textColor,
  mutedColor,
  inputBackground,
  borderColor,
  onTranscribed,
  onError,
  onDismiss,
}: VoiceJournalPanelProps) {
  const { t } = useTranslation();
  const recorder = useAudioRecorder(RECORDING_OPTIONS);
  const recorderState = useAudioRecorderState(recorder, 100);
  const smoothedLevelRef = useRef(0);
  const isRecordingActiveRef = useRef(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const { mutateAsync: transcribe, isPending: isTranscribing } =
    useTranscribeVoice();
  const isRecording = recorderState.isRecording;

  useEffect(() => {
    isRecordingActiveRef.current = isRecording;
  }, [isRecording]);

  useEffect(() => {
    return () => {
      // useAudioRecorder may already have released the native shared object by
      // the time this cleanup runs. Never read recorder.* properties here.
      if (isRecordingActiveRef.current) {
        try {
          void recorder.stop().catch(() => undefined);
        } catch {
          // Shared object already released.
        }
      }
      void setAudioModeAsync({ allowsRecording: false }).catch(() => undefined);
    };
    // Intentionally empty deps: bind once to this mount's recorder instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const raw = isRecording ? normalizeMetering(recorderState.metering) : 0;
    // Exponential smoothing avoids jitter without retaining sample history.
    const next = smoothedLevelRef.current * 0.68 + raw * 0.32;
    smoothedLevelRef.current = next;
    setAudioLevel(next);
  }, [isRecording, recorderState.metering]);

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
    if (isRecording || isTranscribing) {
      return;
    }

    try {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        onError(t("journal.write.voicePermissionDenied"));
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : t("journal.write.voiceRecordFailed")
      );
    }
  };

  const stopRecordingAndTranscribe = async () => {
    if (!isRecordingActiveRef.current && !recorderState.isRecording) {
      return;
    }

    try {
      isRecordingActiveRef.current = false;
      await recorder.stop();
      await setAudioModeAsync({ allowsRecording: false });
      smoothedLevelRef.current = 0;
      setAudioLevel(0);
      const uri = recorder.uri;

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
      onError(
        error instanceof Error
          ? error.message
          : t("journal.write.voiceRecordFailed")
      );
    }
  };

  const discardRecording = async () => {
    try {
      if (isRecordingActiveRef.current || recorderState.isRecording) {
        isRecordingActiveRef.current = false;
        await recorder.stop();
      }
      await setAudioModeAsync({ allowsRecording: false });
    } catch {
      // Dismissing the screen should still succeed if native cleanup fails.
    } finally {
      smoothedLevelRef.current = 0;
      setAudioLevel(0);
      onDismiss?.();
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
  const title = isTranscribing
    ? t("journal.write.voiceTranscribing")
    : isRecording
      ? t("journal.write.voiceListening")
      : t("journal.write.voiceTitle");

  return (
    <View style={[styles.panel, { backgroundColor: inputBackground, borderColor }]}>
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("journal.write.voiceClose")}
          onPress={() => void discardRecording()}
          style={styles.topButton}
        >
          <Ionicons name="chevron-back" size={24} color={textColor} />
        </Pressable>
        <Text style={[styles.navTitle, { color: textColor }]}>
          {t("journal.write.voiceTitle")}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("journal.write.voicePick")}
          disabled={busy}
          onPress={() => {
            void pickAudioFile();
          }}
          style={({ pressed }) => [
            styles.topButton,
            pressed && styles.pressed,
            busy && styles.disabled,
          ]}
        >
          <Ionicons name="ellipsis-horizontal" size={22} color={textColor} />
        </Pressable>
      </View>

      <View style={styles.visualArea}>
        <VoiceOrb level={audioLevel} isRecording={isRecording} />
        <Text style={[styles.title, { color: textColor }]}>{title}</Text>
        <Text style={[styles.body, { color: mutedColor }]}>
          {isRecording
            ? t("journal.write.voiceSharePrompt")
            : t("journal.write.voiceBody")}
        </Text>

        {isRecording ? (
          <>
            <Text style={[styles.duration, { color: textColor }]}>
              {formatDuration(recorderState.durationMillis)}
              <Text style={styles.liveDot}> ●</Text>
            </Text>
            <AudioLevelMeter level={audioLevel} active color={PRIMARY} />
          </>
        ) : null}

        {isTranscribing ? (
          <ActivityIndicator color={PRIMARY} style={styles.spinner} />
        ) : null}
      </View>

      <Text style={[styles.autoSaveHint, { color: mutedColor }]}>
        {t("journal.write.voiceAutoSave")}
      </Text>

      <View style={styles.bottomControls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            isRecording
              ? t("journal.write.voiceStop")
              : t("journal.write.voiceRecord")
          }
          disabled={isTranscribing}
          onPress={() => {
            if (isRecording) {
              void stopRecordingAndTranscribe();
            } else {
              void startRecording();
            }
          }}
          style={({ pressed }) => [
            styles.listenControl,
            pressed && styles.pressed,
            isTranscribing && styles.disabled,
          ]}
        >
          <View style={styles.microphoneCircle}>
            <Ionicons
              name={isRecording ? "mic" : "mic-outline"}
              size={25}
              color={textColor}
            />
          </View>
          <Text style={[styles.listenLabel, { color: textColor }]}>
            {isRecording
              ? t("journal.write.voiceListening")
              : t("journal.write.voiceRecord")}
          </Text>
          <AudioLevelMeter level={audioLevel} active={isRecording} color={PRIMARY} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("journal.write.voiceStop")}
          disabled={!isRecording || isTranscribing}
          onPress={() => void stopRecordingAndTranscribe()}
          style={({ pressed }) => [
            styles.stopButton,
            (!isRecording || isTranscribing) && styles.disabled,
            pressed && isRecording && styles.pressed,
          ]}
        >
          {isTranscribing ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Ionicons name="stop" size={20} color="#FFFFFF" />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    minHeight: 620,
    borderWidth: 1,
    borderRadius: 28,
    overflow: "hidden",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 18,
  },
  topBar: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.74)",
  },
  navTitle: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  visualArea: {
    flex: 1,
    alignItems: "center",
    paddingTop: 16,
  },
  title: {
    marginTop: 12,
    fontSize: 25,
    fontWeight: "800",
    textAlign: "center",
  },
  body: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    paddingHorizontal: 18,
  },
  duration: {
    marginTop: 26,
    fontSize: 19,
    fontWeight: "600",
  },
  liveDot: {
    color: "#FF5B64",
    fontSize: 14,
  },
  spinner: {
    marginTop: 26,
  },
  autoSaveHint: {
    marginBottom: 16,
    textAlign: "center",
    fontSize: 13,
  },
  bottomControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  listenControl: {
    flex: 1,
    minHeight: 68,
    borderRadius: 34,
    backgroundColor: "rgba(255,255,255,0.82)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    gap: 12,
  },
  microphoneCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(233,228,255,0.84)",
  },
  listenLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
  },
  stopButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#1C1C1E",
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.72,
  },
  disabled: {
    opacity: 0.42,
  },
});
