// useApi.ts
"use client";
import { useState, useEffect, useCallback } from "react";
import { GET, POST, PUT, DELETE, ApiResponse } from "../lib/api";
import { AxiosRequestConfig } from "axios";

interface UseApiState<T> extends ApiResponse<T> {
  isLoading: boolean;
}

export function useApi<T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  url: string,
  body?: any,
  config?: AxiosRequestConfig
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    error: null,
    isLoading: true,
  });

  const [trigger, setTrigger] = useState(0);

  const execute = useCallback(() => setTrigger((t) => t + 1), []);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (isMounted) setState((prev) => ({ ...prev, isLoading: true }));
      try {
        let response: ApiResponse<T>;
        switch (method) {
          case "GET":
            response = await GET<T>(url, config);
            break;
          case "POST":
            response = await POST<T>(url, body, config);
            break;
          case "PUT":
            response = await PUT<T>(url, body, config);
            break;
          case "DELETE":
            response = await DELETE<T>(url, config);
            break;
        }
        if (isMounted) setState({ ...response, isLoading: false });
      } catch (error) {
        if (isMounted) {
          setState({
            data: null,
            error: error instanceof Error ? error.message : "An unknown error occurred",
            isLoading: false,
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