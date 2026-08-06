import {
  deleteMemberProfileImageApi,
  uploadMemberProfileImageApi,
  type ProfileImageUpload,
} from "@/api/memberApi";
import { memberMeQueryKey } from "@/hooks/useMemberMe";
import { useAuthStore } from "@/store/authStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useUploadMemberProfileImage = () => {
  const queryClient = useQueryClient();
  const setMember = useAuthStore((state) => state.setMember);

  return useMutation({
    mutationKey: ["members", "me", "profile-image", "upload"],
    mutationFn: (image: ProfileImageUpload) =>
      uploadMemberProfileImageApi(image),
    onSuccess: (member) => {
      queryClient.setQueryData(memberMeQueryKey, member);
      setMember(member);
    },
  });
};

export const useDeleteMemberProfileImage = () => {
  const queryClient = useQueryClient();
  const setMember = useAuthStore((state) => state.setMember);

  return useMutation({
    mutationKey: ["members", "me", "profile-image", "delete"],
    mutationFn: () => deleteMemberProfileImageApi(),
    onSuccess: (member) => {
      queryClient.setQueryData(memberMeQueryKey, member);
      setMember(member);
    },
  });
};
