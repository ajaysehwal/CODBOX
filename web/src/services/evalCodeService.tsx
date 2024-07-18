import { networkRequest } from "./networkRequest";
import { Language, Response } from "../components/interface";

const api = new networkRequest("BASE");

export const evalCodeService = {
  evaluate: async (
    sourceCode: string,
    language: Language,
    userId?: string
  ): Promise<Response> => {
    try {
      const response = await api.post<Response>("/v1/evaluate", {
        source_code: sourceCode,
        language,
        user_id: userId,
      });
      console.log(response)

      if (response.error) {
        return {
          success: false,
          error: response.error,
        };
      }

      if (response.data) {
        return {
          success: true,
          result: response.data.result,
        };
      }

      return {
        success: false,
        error: "No data received from the server",
      };
    } catch (error) {
      console.error("Error in evalCodeService:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  },
};
