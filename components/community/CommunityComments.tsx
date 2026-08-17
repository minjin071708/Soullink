import {
  flattenCommunityComments,
  useCommunityComments,
  useCreateCommunityComment,
  useDeleteCommunityComment,
  useToggleCommunityCommentLike,
  useUpdateCommunityComment,
} from "@/hooks/community/useCommunityComments";
import { useCreateCommunityReport } from "@/hooks/community/useCreateCommunityReport";
import { useAuthStore } from "@/store/authStore";
import type {
  CommunityComment,
  CommunityReportReasonCode,
} from "@/types/community";
import { isSameMemberId } from "@/utils/memberId";
import Fontisto from "@expo/vector-icons/Fontisto";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import axios from "axios";

const TEXT = "#1C1C1E";
const SECONDARY = "#8E8E93";
const CARD = "#FFFFFF";
const ACCENT = "#8A6BE8";
const HEART = "#FF3B30";
const composerBackground = "#e8e8e8";
const APPLE_INK_BACKGROUND = "#1d1d1d";
const DEFAULT_AVATAR = require("@/assets/mascotImages/maskot3dwhite.png");
const MAX_COMMENT = 2000;
const MAX_REPORT_DETAIL = 1000;

const REPORT_REASON_CODES: CommunityReportReasonCode[] = [
  "ABUSE",
  "SPAM",
  "SEXUAL",
  "PERSONAL",
  "SELF_HARM",
  "OTHER",
];

function getReportErrorMessage(
  error: unknown,
  t: (key: string) => string
): string {
  const code = axios.isAxiosError(error)
    ? (error.response?.data as { code?: string } | undefined)?.code
    : undefined;

  switch (code) {
    case "COMMUNITY_REPORT_SELF":
      return t("community.report.errorSelf");
    case "COMMUNITY_REPORT_DUPLICATED":
      return t("community.report.errorDuplicated");
    case "COMMUNITY_REPORT_TARGET_INVALID":
      return t("community.report.errorInvalid");
    case "COMMUNITY_REPORT_DETAIL_REQUIRED":
      return t("community.report.errorDetailRequired");
    default:
      return t("community.report.error");
  }
}

function useKeyboardHeight() {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (event) => {
        setHeight(event.endCoordinates.height + 50);
      }
    );
    const hide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setHeight(0)
    );

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return height;
}

function formatRelativeTime(
  iso: string | undefined,
  formatDays: (count: number) => string,
  formatMonths: (count: number) => string
) {
  if (!iso) {
    return "";
  }

  const created = new Date(iso).getTime();
  if (Number.isNaN(created)) {
    return "";
  }

  const days = Math.max(
    0,
    Math.floor((Date.now() - created) / (1000 * 60 * 60 * 24))
  );

  if (days < 30) {
    return formatDays(Math.max(days, 1));
  }

  return formatMonths(Math.max(1, Math.floor(days / 30)));
}

function CommentItem({
  comment,
  postId,
}: {
  comment: CommunityComment;
  postId: number;
}) {
  const { t } = useTranslation();
  const myMemberId = useAuthStore((state) => state.member?.memberId);
  const likeToggle = useToggleCommunityCommentLike(postId);
  const updateComment = useUpdateCommunityComment(postId);
  const deleteComment = useDeleteCommunityComment(postId);
  const createReport = useCreateCommunityReport();
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.content);
  const [reportReason, setReportReason] =
    useState<CommunityReportReasonCode | null>(null);
  const [reportDetail, setReportDetail] = useState("");

  const isMyComment = isSameMemberId(comment.author.memberId, myMemberId);

  const handleSave = () => {
    const content = draft.trim();
    if (!content || updateComment.isPending) {
      return;
    }

    updateComment.mutate(
      { commentId: comment.commentId, request: { content } },
      {
        onSuccess: () => setEditing(false),
        onError: () => {
          Alert.alert(
            t("community.comments.save"),
            t("community.comments.saveError")
          );
        },
      }
    );
  };

  const handleDelete = () => {
    setMenuOpen(false);
    Alert.alert(
      t("community.comments.deleteTitle"),
      t("community.comments.deleteMessage"),
      [
        { text: t("community.comments.cancel"), style: "cancel" },
        {
          text: t("community.comments.delete"),
          style: "destructive",
          onPress: () => {
            deleteComment.mutate(comment.commentId, {
              onError: () => {
                Alert.alert(
                  t("community.comments.delete"),
                  t("community.comments.deleteError")
                );
              },
            });
          },
        },
      ]
    );
  };

  const openReport = () => {
    setMenuOpen(false);
    setReportReason(null);
    setReportDetail("");
    setReportOpen(true);
  };

  const submitReport = () => {
    if (!reportReason || createReport.isPending) {
      return;
    }

    const detail = reportDetail.trim();
    if (reportReason === "OTHER" && !detail) {
      Alert.alert(
        t("community.report.title"),
        t("community.report.errorDetailRequired")
      );
      return;
    }

    createReport.mutate(
      {
        targetType: "COMMENT",
        targetId: comment.commentId,
        reasonCode: reportReason,
        ...(reportReason === "OTHER" || detail
          ? { detailContent: detail }
          : {}),
      },
      {
        onSuccess: () => {
          setReportOpen(false);
          setReportReason(null);
          setReportDetail("");
          Alert.alert(
            t("community.report.title"),
            t("community.report.success")
          );
        },
        onError: (error) => {
          Alert.alert(
            t("community.report.title"),
            getReportErrorMessage(error, t)
          );
        },
      }
    );
  };

  return (
    <View style={styles.commentCard}>
      <View style={styles.commentBody}>
        <View style={styles.commentHeader}>
          <Image
            source={
              comment.author.profileImageUrl
                ? { uri: comment.author.profileImageUrl }
                : DEFAULT_AVATAR
            }
            style={styles.commentAvatar}
            contentFit="cover"
          />
          <View style={styles.commentMeta}>
            <Text style={styles.commentName} numberOfLines={1}>
              {comment.author.nickname}
            </Text>
            <Text style={styles.commentTime} numberOfLines={1}>
              {formatRelativeTime(
                comment.createdAt,
                (count) => t("home.similarStories.daysAgo", { count }),
                (count) => t("home.similarStories.monthsAgo", { count })
              )}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("community.detail.more")}
            hitSlop={8}
            onPress={() => setMenuOpen(true)}
            style={({ pressed }) => [pressed && styles.pressed]}
          >
            <Fontisto name="more-v-a" size={16} color="gray" />
          </Pressable>
        </View>

        {editing ? (
          <View style={styles.editBox}>
            <TextInput
              value={draft}
              onChangeText={(value) => setDraft(value.slice(0, MAX_COMMENT))}
              multiline
              autoFocus
              textAlignVertical="top"
              style={styles.editInput}
            />
            <View style={styles.editActions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setDraft(comment.content);
                  setEditing(false);
                }}
                style={({ pressed }) => [pressed && styles.pressed]}
              >
                <Text style={styles.editCancel}>
                  {t("community.comments.cancel")}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={updateComment.isPending || !draft.trim()}
                onPress={handleSave}
                style={({ pressed }) => [pressed && styles.pressed]}
              >
                <Text style={styles.editSave}>
                  {updateComment.isPending
                    ? t("community.comments.saving")
                    : t("community.comments.save")}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Text style={styles.commentText}>{comment.content}</Text>
        )}

        <Pressable
          accessibilityRole="button"
          disabled={likeToggle.isPending}
          hitSlop={8}
          onPress={() => {
            if (!likeToggle.isPending) {
              likeToggle.mutate(comment.commentId);
            }
          }}
          style={styles.commentLike}
        >
          <Ionicons
            name={comment.likedByMe ? "heart" : "heart-outline"}
            size={16}
            color={comment.likedByMe ? HEART : SECONDARY}
          />
          <Text style={styles.commentLikeCount}>{comment.likeCount}</Text>
        </Pressable>
      </View>

      <Modal
        transparent
        visible={menuOpen}
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable
          style={styles.menuBackdrop}
          onPress={() => setMenuOpen(false)}
        >
          <View style={styles.menuSheet}>
            {isMyComment ? (
              <>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setDraft(comment.content);
                    setEditing(true);
                    setMenuOpen(false);
                  }}
                  style={({ pressed }) => [
                    styles.menuRow,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons name="create-outline" size={20} color={TEXT} />
                  <Text style={styles.menuText}>
                    {t("community.comments.edit")}
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  disabled={deleteComment.isPending}
                  onPress={handleDelete}
                  style={({ pressed }) => [
                    styles.menuRow,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons name="trash-outline" size={20} color={HEART} />
                  <Text style={styles.menuDangerText}>
                    {t("community.comments.delete")}
                  </Text>
                </Pressable>
              </>
            ) : (
              <Pressable
                accessibilityRole="button"
                onPress={openReport}
                style={({ pressed }) => [
                  styles.menuRow,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name="flag-outline" size={20} color={HEART} />
                <Text style={styles.menuDangerText}>
                  {t("community.report.action")}
                </Text>
              </Pressable>
            )}
            <Pressable
              accessibilityRole="button"
              onPress={() => setMenuOpen(false)}
              style={({ pressed }) => [
                styles.menuRow,
                styles.menuCancel,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.menuCancelText}>
                {t("community.comments.cancel")}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <Modal
        transparent
        visible={reportOpen}
        animationType="fade"
        onRequestClose={() => setReportOpen(false)}
      >
        <Pressable
          style={styles.menuBackdrop}
          onPress={() => setReportOpen(false)}
        >
          <Pressable style={styles.reportSheet} onPress={() => undefined}>
            <Text style={styles.reportTitle}>{t("community.report.title")}</Text>
            <Text style={styles.reportSubtitle}>
              {t("community.report.subtitle")}
            </Text>

            {REPORT_REASON_CODES.map((code) => {
              const selected = reportReason === code;
              return (
                <Pressable
                  key={code}
                  accessibilityRole="button"
                  onPress={() => setReportReason(code)}
                  style={({ pressed }) => [
                    styles.reportReasonRow,
                    selected && styles.reportReasonSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.reportReasonText,
                      selected && styles.reportReasonTextSelected,
                    ]}
                  >
                    {t(`community.report.reasons.${code}`)}
                  </Text>
                  {selected ? (
                    <Ionicons name="checkmark" size={18} color={ACCENT} />
                  ) : null}
                </Pressable>
              );
            })}

            {reportReason === "OTHER" ? (
              <TextInput
                value={reportDetail}
                onChangeText={(value) =>
                  setReportDetail(value.slice(0, MAX_REPORT_DETAIL))
                }
                placeholder={t("community.report.detailPlaceholder")}
                placeholderTextColor={SECONDARY}
                multiline
                maxLength={MAX_REPORT_DETAIL}
                style={styles.reportDetailInput}
              />
            ) : null}

            <Pressable
              accessibilityRole="button"
              disabled={!reportReason || createReport.isPending}
              onPress={submitReport}
              style={({ pressed }) => [
                styles.reportSubmit,
                (!reportReason || createReport.isPending) &&
                  styles.reportSubmitDisabled,
                pressed && reportReason && styles.pressed,
              ]}
            >
              {createReport.isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.reportSubmitText}>
                  {t("community.report.submit")}
                </Text>
              )}
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => setReportOpen(false)}
              style={({ pressed }) => [
                styles.menuRow,
                styles.menuCancel,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.menuCancelText}>
                {t("community.comments.cancel")}
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function CommentComposer({
  postId,
  keyboardHeight,
  autoFocus = false,
}: {
  postId: number;
  keyboardHeight: number;
  autoFocus?: boolean;
}) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const createComment = useCreateCommunityComment(postId);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (!autoFocus) {
      return;
    }
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 350);
    return () => clearTimeout(timer);
  }, [autoFocus]);

  const canSend = draft.trim().length > 0 && !createComment.isPending;
  const isKeyboardVisible = keyboardHeight > 0;

  const handleSend = () => {
    const content = draft.trim();
    if (!content || createComment.isPending) {
      return;
    }

    createComment.mutate(
      { content },
      {
        onSuccess: () => setDraft(""),
        onError: () => {
          Alert.alert(
            t("community.comments.send"),
            t("community.comments.createError")
          );
        },
      }
    );
  };

  return (
    <View style={{ paddingBottom: keyboardHeight }}>
      <View
        style={[
          styles.composer,
          {
            paddingBottom: isKeyboardVisible
              ? 10
              : Math.max(insets.bottom, 70),
          },
        ]}
      >
        <TextInput
          ref={inputRef}
          value={draft}
          onChangeText={(value) => setDraft(value.slice(0, MAX_COMMENT))}
          placeholder={t("community.comments.placeholder")}
          placeholderTextColor={SECONDARY}
          multiline
          maxLength={MAX_COMMENT}
          autoFocus={autoFocus}
          style={styles.composerInput}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("community.comments.send")}
          disabled={!canSend}
          onPress={handleSend}
          style={({ pressed }) => [
            styles.sendButton,
            !canSend && styles.sendButtonDisabled,
            pressed && canSend && styles.pressed,
          ]}
        >
          {createComment.isPending ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Ionicons name="arrow-up" size={18} color="#FFFFFF" />
          )}
        </Pressable>
      </View>
    </View>
  );
}

export function CommunityComments({
  postId,
  commentCount,
  header,
  hideHeading = false,
  autoFocusComposer = false,
}: {
  postId: number;
  commentCount: number;
  header?: ReactNode;
  hideHeading?: boolean;
  autoFocusComposer?: boolean;
}) {
  const { t } = useTranslation();
  const keyboardHeight = useKeyboardHeight();
  const commentsQuery = useCommunityComments(postId);
  const comments = useMemo(
    () => flattenCommunityComments(commentsQuery.data),
    [commentsQuery.data]
  );

  return (
    <View style={styles.flex}>
      <FlatList
        data={comments}
        keyExtractor={(item) => String(item.commentId)}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (
            commentsQuery.hasNextPage &&
            !commentsQuery.isFetchingNextPage
          ) {
            void commentsQuery.fetchNextPage();
          }
        }}
        ListHeaderComponent={
          <View>
            {header}
            {hideHeading ? null : (
              <Text style={styles.sectionTitle}>
                {t("community.comments.title", { count: commentCount })}
              </Text>
            )}
            {commentsQuery.isLoading ? (
              <View style={styles.stateRow}>
                <ActivityIndicator color={ACCENT} />
                <Text style={styles.stateText}>
                  {t("community.comments.loading")}
                </Text>
              </View>
            ) : commentsQuery.isError ? (
              <View style={styles.stateRow}>
                <Text style={styles.stateText}>
                  {t("community.comments.error")}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    void commentsQuery.refetch();
                  }}
                  style={({ pressed }) => [
                    styles.retryButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.retryText}>{t("community.retry")}</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <CommentItem comment={item} postId={postId} />
        )}
        ListEmptyComponent={
          commentsQuery.isLoading || commentsQuery.isError ? null : (
            <Text style={styles.emptyText}>
              {t("community.comments.empty")}
            </Text>
          )
        }
        ListFooterComponent={
          commentsQuery.isFetchingNextPage ? (
            <View style={styles.nextPageBox}>
              <ActivityIndicator color={ACCENT} />
            </View>
          ) : null
        }
      />
      <CommentComposer
        postId={postId}
        keyboardHeight={keyboardHeight}
        autoFocus={autoFocusComposer}
      />
    </View>
  );
}

export function CommunityCommentSheet({
  visible,
  postId,
  commentCount,
  onClose,
}: {
  visible: boolean;
  postId: number;
  commentCount: number;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.sheetRoot} edges={["top"]}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>
            {t("community.comments.title", { count: commentCount })}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("community.detail.closeImage")}
            hitSlop={8}
            onPress={onClose}
            style={({ pressed }) => [styles.sheetClose, pressed && styles.pressed]}
          >
            <Ionicons name="close" size={22} color={TEXT} />
          </Pressable>
        </View>
        {visible ? (
          <CommunityComments
            postId={postId}
            commentCount={commentCount}
            hideHeading
            autoFocusComposer
          />
        ) : null}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  sectionTitle: {
    marginTop: 28,
    marginBottom: 12,
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.4,
    color: TEXT,
  },
  commentCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E5E5EA",
  },
  commentBody: {
    flex: 1,
    gap: 6,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  commentMeta: {
    flex: 1,
    gap: 1,
  },
  commentName: {
    fontSize: 15,
    fontWeight: "600",
    color: TEXT,
  },
  commentTime: {
    fontSize: 12,
    color: SECONDARY,
  },
  commentText: {
    fontSize: 15,
    lineHeight: 21,
    color: TEXT,
  },
  commentLike: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    marginTop: 2,
  },
  commentLikeCount: {
    fontSize: 13,
    fontWeight: "500",
    color: SECONDARY,
  },
  editBox: {
    gap: 8,
  },
  editInput: {
    minHeight: 72,
    borderRadius: 12,
    backgroundColor: "#F2F2F7",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: TEXT,
  },
  editActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
  },
  editCancel: {
    fontSize: 14,
    fontWeight: "600",
    color: SECONDARY,
  },
  editSave: {
    fontSize: 14,
    fontWeight: "600",
    color: ACCENT,
  },
  emptyText: {
    color: SECONDARY,
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 20,
  },
  stateRow: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 16,
  },
  stateText: {
    color: SECONDARY,
    fontSize: 14,
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: CARD,
  },
  retryText: {
    color: ACCENT,
    fontSize: 14,
    fontWeight: "600",
  },
  nextPageBox: {
    paddingVertical: 16,
    alignItems: "center",
  },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: composerBackground,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E5EA",
  },
  composerInput: {
    flex: 1,
    maxHeight: 120,
    minHeight: 40,
    borderRadius: 20,
    backgroundColor: CARD,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: TEXT,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: APPLE_INK_BACKGROUND,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.32)",
    justifyContent: "flex-end",
    paddingHorizontal: 12,
    paddingBottom: 28,
  },
  menuSheet: {
    backgroundColor: CARD,
    borderRadius: 16,
    overflow: "hidden",
  },
  menuRow: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 18,
  },
  menuText: {
    fontSize: 17,
    color: TEXT,
  },
  menuDangerText: {
    fontSize: 17,
    color: HEART,
  },
  menuCancel: {
    justifyContent: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E5EA",
  },
  menuCancelText: {
    fontSize: 17,
    fontWeight: "600",
    color: ACCENT,
  },
  reportSheet: {
    backgroundColor: CARD,
    borderRadius: 16,
    overflow: "hidden",
    paddingTop: 16,
  },
  reportTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: TEXT,
    textAlign: "center",
    paddingHorizontal: 18,
  },
  reportSubtitle: {
    marginTop: 4,
    marginBottom: 8,
    fontSize: 13,
    color: SECONDARY,
    textAlign: "center",
    paddingHorizontal: 18,
  },
  reportReasonRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
  },
  reportReasonSelected: {
    backgroundColor: "#F2F2F7",
  },
  reportReasonText: {
    fontSize: 16,
    color: TEXT,
  },
  reportReasonTextSelected: {
    fontWeight: "600",
  },
  reportDetailInput: {
    marginHorizontal: 16,
    marginTop: 8,
    minHeight: 80,
    borderRadius: 12,
    backgroundColor: "#F2F2F7",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: TEXT,
  },
  reportSubmit: {
    marginHorizontal: 16,
    marginTop: 12,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: HEART,
    alignItems: "center",
    justifyContent: "center",
  },
  reportSubmitDisabled: {
    opacity: 0.4,
  },
  reportSubmitText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.7,
  },
  sheetRoot: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 8,
    minHeight: 48,
  },
  sheetTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.4,
    color: TEXT,
  },
  sheetClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: CARD,
    alignItems: "center",
    justifyContent: "center",
  },
});
