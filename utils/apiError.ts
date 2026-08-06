import axios from "axios";

/** Client/network timeout from Axios (not a confirmed backend analysis failure). */
export const isApiTimeoutError = (error: unknown): boolean => {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  return error.code === "ECONNABORTED" || error.code === "ETIMEDOUT";
};
