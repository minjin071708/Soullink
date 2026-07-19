import {
  authTokensSchema,
  loginResponseSchema,
  memberSchema,
} from "@/schemas/authSchema";
import { z } from "zod";

export type MemberType = z.infer<typeof memberSchema>;

export type LoginResponseType = z.infer<typeof loginResponseSchema>;

export type AuthTokensType = z.infer<typeof authTokensSchema>;

export type LoginRequestType = {
  memberId: string;
  password: string;
};

export type RefreshRequestType = {
  refreshToken: string;
};
