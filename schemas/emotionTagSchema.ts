import { z } from "zod";

/** EMO-007 GET /api/v1/emotion-tags item */
export const emotionTagSchema = z.object({
  tagId: z.number().int().positive(),
  tagCode: z.string().max(30),
  tagName: z.string().max(50),
  categoryCode: z.string().max(30),
  categoryName: z.string().max(50),
  displayOrder: z.number().int(),
  active: z.boolean(),
});

export const emotionTagsResponseSchema = z.object({
  success: z.boolean(),
  code: z.string(),
  message: z.string(),
  data: z.array(emotionTagSchema),
  requestId: z.string(),
});

export type EmotionTag = z.infer<typeof emotionTagSchema>;
export type EmotionTagsResponse = z.infer<typeof emotionTagsResponseSchema>;
