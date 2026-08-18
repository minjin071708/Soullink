import { fetchMemberMeApi } from "@/api/memberApi";
import { useCanFetchAuthenticatedData } from "@/hooks/useCanFetchAuthenticatedData";
import { useAuthStore } from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export const memberMeQueryKey = ["members", "me"] as const;

export const useMemberMe = (enabled = true) => {
  const setMember = useAuthStore((state) => state.setMember);
  const cachedMember = useAuthStore((state) => state.member);
  const canFetch = useCanFetchAuthenticatedData();

  const query = useQuery({
    queryKey: memberMeQueryKey,
    queryFn: fetchMemberMeApi,
    enabled: canFetch && enabled,
    retry: 1,
    placeholderData: cachedMember ?? undefined,
  });

  useEffect(() => {
    if (query.data && !query.isPlaceholderData) {
      setMember(query.data);
    }
  }, [query.data, query.isPlaceholderData, setMember]);

  return query;
};
