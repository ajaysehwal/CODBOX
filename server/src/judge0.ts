import https from "https";
import { SubmissionResult } from "./interface";
interface RequestData {
  language_id: number;
  source_code: string;
  stdin: string;
}

export class judge0 {
  private basePath: string;
  private languageMap: Record<string, number> = {
    typescript: 94,
    javascript: 93,
    python: 71,
    java: 62,
    cpp: 53,
    rust: 73,
    php: 68,
  };
  constructor(private apiKey: string, private apiHost: string) {
    this.basePath = "/submissions";
  }
  getRequestOptions(
    method: string,
    path: string,
    headers: Record<string, string> = {}
  ): https.RequestOptions {
    return {
      method,
      hostname: this.apiHost,
      path,
      headers: {
        ...headers,
        "x-rapidapi-key": this.apiKey,
        "x-rapidapi-host": this.apiHost,
        "Content-Type": "application/json",
      },
    };
  }
  private getSubmissionResult(token: string): Promise<SubmissionResult> {
    return new Promise((resolve, reject) => {
      const options = this.getRequestOptions(
        "GET",
        `${this.basePath}/${token}?base64_encoded=false&fields=*`
      );

      const req = https.request(options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          resolve(JSON.parse(data));
        });
      });

      req.on("error", (error) => {
        reject(new Error(`Result retrieval error: ${error.message}`));
      });

      req.end();
    });
  }
  private submitCode(requestData: RequestData): Promise<string> {
    return new Promise((resolve, reject) => {
      const options = this.getRequestOptions(
        "POST",
        `${this.basePath}?base64_encoded=false&wait=false&fields=*`
      );

      const req = https.request(options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          const result: SubmissionResult = JSON.parse(data);
          if (result.token) {
            resolve(result.token);
          } else {
            reject(new Error("Token not received"));
          }
        });
      });

      req.on("error", (error) => {
        reject(new Error(`Submission error: ${error.message}`));
      });

      req.write(JSON.stringify(requestData));
      req.end();
    });
  }
  public async executeCode(
    request: RequestData,
    delay: number = 5000
  ): Promise<SubmissionResult> {
    const token = await this.submitCode(request);

    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const result = await this.getSubmissionResult(token);
          resolve(result);
        } catch (error) {
          reject(`Error retrieving submission result: ${error}`);
        }
      }, delay);
    });
  }
  public async getLanguageId(language: string): Promise<number | null> {
    return this.languageMap[language.toLowerCase()] || null;
  }
}
