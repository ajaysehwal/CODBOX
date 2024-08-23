import https from "https";
import { SubmissionResult } from "../types";
import config from "../config";
interface RequestData {
  language_id: number;
  source_code: string;
  stdin: string;
}
export class Judge0 {
  private readonly basePath: string = "/submissions";
  private readonly languageMap: Record<string, number> = {
    typescript: 94,
    javascript: 93,
    python: 71,
    java: 62,
    cpp: 53,
    rust: 73,
    php: 68,
  };
  private getRequestOptions(
    method: string,
    path: string,
    headers: Record<string, string> = {}
  ): https.RequestOptions {
    return {
      method,
      hostname: config.judge0ApiHost,
      path,
      headers: {
        ...headers,
        "x-rapidapi-key": config.judge0ApiKey,
        "x-rapidapi-host": config.judge0ApiHost,
        "Content-Type": "application/json",
      },
    };
  }

  private async getSubmissionResult(token: string): Promise<SubmissionResult> {
    const options = this.getRequestOptions(
      "GET",
      `${this.basePath}/${token}?base64_encoded=false&fields=*`
    );

    return this.makeHttpRequest<SubmissionResult>(options);
  }

  private async submitCode(requestData: RequestData): Promise<string> {
    const options = this.getRequestOptions(
      "POST",
      `${this.basePath}?base64_encoded=false&wait=false&fields=*`
    );

    const result = await this.makeHttpRequest<SubmissionResult>(
      options,
      JSON.stringify(requestData)
    );
    if (!result.token) {
      throw new Error("Token not received");
    }
    return result.token;
  }

  private makeHttpRequest<T>(
    options: https.RequestOptions,
    data?: string
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let responseData = "";
        res.on("data", (chunk) => {
          responseData += chunk;
        });
        res.on("end", () => {
          try {
            resolve(JSON.parse(responseData));
          } catch (error) {
            reject(new Error(`Failed to parse response: ${error}`));
          }
        });
      });

      req.on("error", (error) => {
        reject(new Error(`HTTP request failed: ${error.message}`));
      });

      if (data) {
        req.write(data);
      }
      req.end();
    });
  }

  public async executeCode(
    request: RequestData,
    delay: number = 500
  ): Promise<SubmissionResult> {
    const token = await this.submitCode(request);
    await new Promise((resolve) => setTimeout(resolve, delay));
    return this.getSubmissionResult(token);
  }

  public getLanguageId(language: string): number | null {
    return this.languageMap[language.toLowerCase()] || null;
  }
}
