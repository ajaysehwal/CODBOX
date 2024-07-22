// api.ts
import axios, { AxiosRequestConfig } from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_SERVER as string;

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
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
  body?: any,
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
    return {
      data: null,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

export const GET = <T>(url: string, config?: AxiosRequestConfig) =>
  apiRequest<T>("GET", url, undefined, config);

export const POST = <T>(url: string, body?: any, config?: AxiosRequestConfig) =>
  apiRequest<T>("POST", url, body, config);

export const PUT = <T>(url: string, body?: any, config?: AxiosRequestConfig) =>
  apiRequest<T>("PUT", url, body, config);

export const DELETE = <T>(url: string, config?: AxiosRequestConfig) =>
  apiRequest<T>("DELETE", url, undefined, config);