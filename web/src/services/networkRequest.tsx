import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from "axios";

// Define server URLs
const SERVERS = {
  BASE: process.env.NEXT_PUBLIC_BASE_SERVER as string,
  // Add more servers as needed
};

// Define HTTP request methods
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

// Define response type
interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export class networkRequest {
  private axiosInstance: AxiosInstance;

  constructor(public server: keyof typeof SERVERS = "BASE") {
    this.axiosInstance = axios.create({
      baseURL: SERVERS[server],
      timeout: 10000,
    });

    this.axiosInstance.interceptors.request.use(
      (config) => {
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  public async request<T>(
    method: HttpMethod,
    route: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.request({
        method,
        url: route,
        data,
        ...config,
      });

      return { data: response.data, error: null };
    } catch (error) {
      console.error("API request failed:", error);
      return {
        data: null,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
  public async get<T>(
    route: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>("GET", route, undefined, config);
  }

  public async post<T>(
    route: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>("POST", route, data, config);
  }

  public async put<T>(
    route: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>("PUT", route, data, config);
  }

  public async delete<T>(
    route: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>("DELETE", route, undefined, config);
  }
}
