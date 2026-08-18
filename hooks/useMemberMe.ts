import { fetchMemberMeApi } from "@/api/memberApi";
import { useCanFetchAuthenticatedData } from "@/hooks/useCanFetchAuthenticatedData";
import { useAuthStore } from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export const memberMeQueryKey = ["members", "me"] as const;

export const useMemberMe = (enabled = true) => {
  const setMember = useAuthStore((state) => state.setMember);
  const canFetch = useCanFetchAuthenticatedData();

  const query = useQuery({
    queryKey: memberMeQueryKey,
    queryFn: fetchMemberMeApi,
    enabled: canFetch && enabled,
    retry: 1,
  });

  useEffect(() => {
    if (query.data) {
      setMember(query.data);
    }
  }, [query.data, setMember]);

  return query;
};
