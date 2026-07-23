import { refreshSession } from "@/api/sessionRefresh";
import { getAccessToken } from "@/api/tokenManager";
import i18n from "@/i18n";
import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

type RetriableConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  skipAuthRefresh?: boolean;
};

type AcceptLanguage = "en" | "ko" | "mn";

const baseURL = process.env.EXPO_PUBLIC_API_URL;

if (!baseURL) {
  throw new Error("EXPO_PUBLIC_API_URL is not defined in .env");
}

function resolveAcceptLanguage(): AcceptLanguage {
  const language = (i18n.resolvedLanguage ?? i18n.language ?? "mn")
    .toLowerCase()
    .split("-")[0];

  if (language === "en" || language === "ko" || language === "mn") {
    return language;
  }

  return "mn";
}

const axiosInstance = axios.create({
  baseURL,
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  async (config: RetriableConfig) => {
    config.headers["Accept-Language"] = resolveAcceptLanguage();

    if (config.skipAuthRefresh) {
      return config;
    }

    const accessToken = await getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  async (error: unknown) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableConfig | undefined;
    const status = error.response?.status;

    if (
      !originalRequest ||
      originalRequest.skipAuthRefresh ||
      originalRequest._retry ||
      (status !== 401 && status !== 403)
    ) {
      return Promise.reject(error);
    }

    const url = originalRequest.url ?? "";
    if (
      url.includes("auth/login") ||
      url.includes("auth/social/login") ||
      url.includes("auth/social/signup") ||
      url.includes("auth/token/refresh") ||
      url.includes("auth/logout")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const accessToken = await refreshSession();
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  }
);

export default axiosInstance;
