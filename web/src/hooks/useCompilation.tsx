import { useState, useCallback, useEffect } from "react";
import { useToast } from "../components/ui/use-toast";
import { useSocket } from "../context";
import { Language, Result } from "@/components/interface";

interface CompilationPayload {
  code: string;
  language: Language;
  type: "request";
}

export function useCompilation(code: string, language: Language) {
  const { toast } = useToast();
  const { compilingSocket: ws } = useSocket();

  const [isOutputOpen, setIsOutputOpen] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);

  const execute = useCallback(() => {
    if (!ws) {
      toast({
        title: "Error",
        description: "WebSocket connection is not available.",
      });
      return;
    }

    setIsCompiling(true);
    setResult(null);
    setIsOutputOpen(true);

    const payload: CompilationPayload = { code, language, type: "request" };
    ws.send(JSON.stringify(payload));
  }, [code, language, ws, toast]);

  useEffect(() => {
    if (!ws) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const response: Result = JSON.parse(event.data);
        setResult(response);
        setIsCompiling(false);
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
        toast({
          title: "Error",
          description: "Failed to process server response.",
        });
      }
    };

    ws.addEventListener("message", handleMessage);

    return () => {
      ws.removeEventListener("message", handleMessage);
    };
  }, [ws, toast]);

  return { isOutputOpen, isCompiling, result, execute };
}
