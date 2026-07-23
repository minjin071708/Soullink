import { updateMemberMeApi } from "@/api/memberApi";
import { memberMeQueryKey } from "@/hooks/useMemberMe";
import { useAuthStore } from "@/store/authStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useUpdateMemberMe = () => {
  const queryClient = useQueryClient();
  const setMember = useAuthStore((state) => state.setMember);

  return useMutation({
    mutationFn: updateMemberMeApi,
    onSuccess: (member) => {
      queryClient.setQueryData(memberMeQueryKey, member);
      setMember(member);
    },
  });
};
