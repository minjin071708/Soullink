import { refreshSession } from "@/api/sessionRefresh";
import { getAccessToken } from "@/api/tokenManager";
import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

type RetriableConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  skipAuthRefresh?: boolean;
};

const baseURL = process.env.EXPO_PUBLIC_API_URL;

if (!baseURL) {
  throw new Error("EXPO_PUBLIC_API_URL is not defined in .env");
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
