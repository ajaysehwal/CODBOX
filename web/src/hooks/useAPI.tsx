"use client";
import { useState, useEffect, useCallback } from "react";
import { GET, POST, PUT, DELETE, ApiResponse } from "../lib/api";
import { AxiosRequestConfig, AxiosError } from "axios";

interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

interface UseApiState<T> {
  data: T | null;
  error: ApiError | null;
  isLoading: boolean;
  isSuccess: boolean;
}

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

const apiMethods = {
  GET,
  POST,
  PUT,
  DELETE,
};

function createApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    return {
      message: error.message,
      code: error.code,
      details: error.response?.data,
    };
  }
  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }
  return {
    message: "An unknown error occurred",
  };
}

export function useApi<T>(
  method: HttpMethod,
  url: string,
  body?: any,
  config?: AxiosRequestConfig
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    error: null,
    isLoading: false,
    isSuccess: false,
  });

  const [trigger, setTrigger] = useState(0);

  const execute = useCallback((newBody?: any, newConfig?: AxiosRequestConfig) => {
    setTrigger((t) => t + 1);
    if (newBody !== undefined) body = newBody;
    if (newConfig !== undefined) config = newConfig;
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!isMounted) return;

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const apiMethod = apiMethods[method];
        const response: ApiResponse<T> = await apiMethod(url, body, config);

        if (isMounted) {
          setState({
            data: response.data,
            error: null,
            isLoading: false,
            isSuccess: true,
          });
        }
      } catch (error) {
        if (isMounted) {
          setState({
            data: null,
            error: createApiError(error),
            isLoading: false,
            isSuccess: false,
          });
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [method, url, body, config, trigger]);

  return { ...state, refetch: execute };
}

export function useGet<T>(url: string, config?: AxiosRequestConfig) {
  return useApi<T>("GET", url, undefined, config);
}

export function usePost<T>(url: string, body?: any, config?: AxiosRequestConfig) {
  return useApi<T>("POST", url, body, config);
}

export function usePut<T>(url: string, body?: any, config?: AxiosRequestConfig) {
  return useApi<T>("PUT", url, body, config);
}

export function useDelete<T>(url: string, config?: AxiosRequestConfig) {
  return useApi<T>("DELETE", url, undefined, config);
}