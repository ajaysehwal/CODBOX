export interface HealthCheckResult {
  status: "OK" | "WARNING" | "CRITICAL";
  version: string;
  uptime: number;
  responseTime: number;
  memoryUsage: {
    total: number;
    free: number;
    usedPercentage: number;
  };
  cpuLoad: number[];
  result?: any;
}

type Language =
  | "javascript"
  | "typescript"
  | "python"
  | "java"
  | "cpp"
  | "php"
  | "rust";

export interface WebSocketMessage {
  code: string;
  language: Language;
  type: "request";
}
