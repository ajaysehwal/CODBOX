import { useState, useCallback } from "react";
import { useToast } from "../components/ui/use-toast";
import { evalCodeService } from "../services/evalCodeService";
import { SubmissionResult, Language } from "../components/interface";
import { useAuth } from "../context";

export function useCompilation(code: string, language: Language) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isOutputOpen, setIsOutputOpen] = useState(false);
  const [compileResponse, setCompileResponse] =
    useState<SubmissionResult | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);

  const evalCode = useCallback(async () => {
    setIsCompiling(true);
    setIsOutputOpen(true);
    try {
      const result = await evalCodeService.evaluate(code, language, user?.uid);
      if (!result.success) {
        setIsOutputOpen(false);
        toast({
          variant: "destructive",
          title: result.error || "Unknown error occurred",
          description: "There was a problem with your request.",
        });
        return;
      }
      if (result.result) {
        setCompileResponse(result.result);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: error.message || "Unknown error occurred",
        description: "There was a problem with your request.",
      });
      console.error(error);
    } finally {
      setIsCompiling(false);
    }
  }, [code, language, user, toast]);

  return { isOutputOpen, isCompiling, compileResponse, evalCode };
}
