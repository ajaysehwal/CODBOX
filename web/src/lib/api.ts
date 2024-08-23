import axios, { AxiosRequestConfig, AxiosError, AxiosInstance } from "axios";

interface ApiError {
  message: string;
  code?: string | number;
  details?: unknown;
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_SERVER as string;

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

async function apiRequest<T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  try {
    const response = await api.request<T>({
      method,
      url,
      data: body,
      ...config,
    });
    return { data: response.data, error: null };
  } catch (error) {
    const apiError: ApiError = {
      message: "An unknown error occurred",
      code: "UNKNOWN_ERROR",
    };

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<unknown>;
      if (axiosError.response) {
        apiError.message =
          (axiosError.response.data as { message?: string })?.message ||
          axiosError.message;
        apiError.code = axiosError.response.status;
        apiError.details = axiosError.response.data;
      } else if (axiosError.request) {
        apiError.message = "No response received from the server";
        apiError.code = "NO_RESPONSE";
      } else {
        apiError.message = axiosError.message;
        apiError.code = "REQUEST_SETUP_ERROR";
      }
    } else if (error instanceof Error) {
      apiError.message = error.message;
      apiError.code = "UNEXPECTED_ERROR";
    }

    return { data: null, error: apiError };
  }
}

export const GET = <T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => apiRequest<T>("GET", url, undefined, config);

export const POST = <T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => apiRequest<T>("POST", url, body, config);

export const PUT = <T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => apiRequest<T>("PUT", url, body, config);

export const DELETE = <T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => apiRequest<T>("DELETE", url, undefined, config);
