import { Language, Response } from "../components/interface";
import { POST } from "../lib/api";
export const evalCodeService = {
  evaluate: async (
    sourceCode: string,
    language: Language,
    userId?: string
  ): Promise<Response> => {
    try {
      const response = await POST<Response>("/v1/evaluate", {
        source_code: sourceCode,
        language,
        user_id: userId,
      });
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
