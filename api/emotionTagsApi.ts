import {
  emotionTagsResponseSchema,
  type EmotionTag,
} from "@/schemas/emotionTagSchema";
import axiosInstance from "./axiosInstance";

/**
 * EMO-007 GET /api/v1/emotion-tags
 * Master list of selectable emotion cause tags.
 */
export const getEmotionTagsApi = async (
  categoryCode = "CAUSE"
): Promise<EmotionTag[]> => {
  const response = await axiosInstance.get("api/v1/emotion-tags", {
    params: { categoryCode, activeOnly: true },
  });

  return emotionTagsResponseSchema.parse(response.data).data;
};
