import { createCommunityReportApi } from "@/api/communityApi";
import type { CreateCommunityReportRequest } from "@/types/community";
import { useMutation } from "@tanstack/react-query";

export const useCreateCommunityReport = () => {
  return useMutation({
    mutationKey: ["create-community-report"],
    mutationFn: (request: CreateCommunityReportRequest) =>
      createCommunityReportApi(request),
  });
};
