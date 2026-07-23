import { fetchMemberMeApi } from "@/api/memberApi";
import { useAuthStore } from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export const memberMeQueryKey = ["members", "me"] as const;

export const useMemberMe = (enabled = true) => {
  const setMember = useAuthStore((state) => state.setMember);

  const query = useQuery({
    queryKey: memberMeQueryKey,
    queryFn: fetchMemberMeApi,
    enabled,
    retry: 1,
  });

  useEffect(() => {
    if (query.data) {
      setMember(query.data);
    }
  }, [query.data, setMember]);

  return query;
};
