"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import * as monaco from "monaco-editor";

import { useAuth, useSocket } from "@/context";
import { useToast } from "../ui/use-toast";
import { ToastAction } from "../ui/toast";
import { CodeOutput } from "./output";
import { EditorHeader } from "./header";
import SetupMonaco from "./setUpMonaco";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
import { SubmissionResult, Response, Language, Theme, CodeChange } from "../interface";

const Editor = dynamic(() => import("@monaco-editor/react").then((mod) => mod.default), { ssr: false });

const DEFAULT_LANGUAGE: Language = "javascript";
const DEFAULT_THEME: Theme = "light";
const DEFAULT_CODE = `/**
 * CodeXF - A platform for seamless collaboration in coding.
 * Connect, code, and create together in real-time!
 */`;

export default function CodeEditor() {
  const searchParams = useSearchParams();
  const socket = useSocket();
  const { user } = useAuth();
  const { toast } = useToast();
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);
  const [code, setCode] = useState<string>(DEFAULT_CODE);
  const [isOutputOpen, setIsOutputOpen] = useState<boolean>(false);
  const [compileResponse, setCompileResponse] = useState<SubmissionResult | null>(null);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const groupId = searchParams.get("id") as string;

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    SetupMonaco();
  };

  const showErrorToast = useCallback((error: string) => {
    toast({
      variant: "destructive",
      title: error,
      description: "There was a problem with your request.",
      action: <ToastAction altText="Try again">Try again</ToastAction>,
    });
  }, [toast]);

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value === undefined) return;

    setCode(value);
    if (!groupId || !editorRef.current) return;

    const model = editorRef.current.getModel();
    if (!model) return;

    const change = {
      delta: value,
      range: model.getFullModelRange(),
    };
    socket?.emit("codeChange", groupId, change);
  }, [groupId, socket]);

  const evalCode = useCallback(() => {
    setIsCompiling(true);
    setIsOutputOpen(true);

    const evalRequest = {
      source_code: code,
      language,
      user_id: user?.uid,
    };

    socket?.emit("evalcode", evalRequest, (response: Response) => {
      if (!response.success) {
        showErrorToast(response.error || "Unknown error occurred");
        setIsOutputOpen(false);
      } else if (response.result) {
        setCompileResponse(response.result);
      } else {
        setIsOutputOpen(false);
        showErrorToast("Internal Server error");
      }
      setIsCompiling(false);
    });
  }, [code, language, user, socket, showErrorToast]);

  useEffect(() => {
    if (!groupId || !socket) return;

    const handleCodeUpdate = (response: { updatedCode: string; change: CodeChange }) => {
      setCode(response.updatedCode);
    };

    socket.emit("codeTemplate", groupId, (initialCode: string) => {
      setCode(initialCode);
      if (editorRef.current) {
        editorRef.current.setValue(initialCode);
      }
    });

    socket.on("codeUpdate", handleCodeUpdate);

    return () => {
      socket.off("codeUpdate", handleCodeUpdate);
    };
  }, [socket, groupId]);

  return (
    <ResizablePanelGroup direction="vertical" className="w-full">
      <ResizablePanel defaultSize={75}>
        <EditorHeader
          theme={theme}
          language={language}
          onThemeChange={setTheme}
          onLanguageChange={setLanguage}
          onEvalCode={evalCode}
        />
        <Editor
          height="85vh"
          language={language}
          theme={theme}
          value={code}
          defaultValue={DEFAULT_CODE}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
        />
      </ResizablePanel>
      <ResizableHandle />
      {isOutputOpen && (
        <ResizablePanel defaultSize={25} className="border-gray-300">
          <CodeOutput
            Loading={isCompiling}
            result={compileResponse}
          />
        </ResizablePanel>
      )}
    </ResizablePanelGroup>
  );
}