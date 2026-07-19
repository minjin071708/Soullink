import { z } from "zod";

export const memberSchema = z.object({
  memberNo: z.number(),
  memberId: z.string(),
  nickname: z.string().default(""),
  email: z.string().optional().default(""),
  memberStatus: z
    .enum(["ACTIVE", "INACTIVE", "SUSPENDED"])
    .default("ACTIVE"),
});

export const authTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  tokenType: z.string().default("Bearer"),
  accessTokenExpiresIn: z.number(),
  refreshTokenExpiresAt: z.string(),
});

export const loginDataSchema = authTokensSchema.extend({
  member: memberSchema.nullable(),
});

export const loginResponseSchema = z.object({
  success: z.boolean(),
  code: z.string(),
  message: z.string(),
  data: loginDataSchema,
  requestId: z.string().optional().default(""),
});

export const refreshResponseSchema = z.object({
  success: z.boolean(),
  code: z.string(),
  message: z.string(),
  data: authTokensSchema,
  requestId: z.string().optional().default(""),
});

/** @deprecated use authTokensSchema */
export const loginTokensSchema = authTokensSchema;
