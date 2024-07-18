"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import * as monaco from "monaco-editor";
import { useAuth, useSocket } from "@/context";
import { useToast } from "../ui/use-toast";
import { CodeOutput } from "./output";
import { EditorHeader } from "./header";
import SetupMonaco from "./setUpMonaco";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { SubmissionResult, Language, Theme } from "../interface";
import { evalCodeService } from "../../services/evalCodeService";
import { useCodeSync } from "../../hooks/useCodeSync";
import { DEFAULT_LANGUAGE, DEFAULT_THEME, DEFAULT_CODE } from "../constants";
import { useGroupsStore } from "@/zustand";
import useDebounce from "@/hooks/useDebounce";

const Editor = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.default),
  { ssr: false }
);

export default function CodeEditor() {
  const searchParams = useSearchParams();
  const socket = useSocket();
  const { user } = useAuth();
  const { toast } = useToast();
  const { members } = useGroupsStore();
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE[0]);
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME[1]);
  const [code, setCode] = useState<string>(DEFAULT_CODE);
  const [localCode, setLocalCode] = useState<string>(DEFAULT_CODE);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [isOutputOpen, setIsOutputOpen] = useState<boolean>(false);
  const [compileResponse, setCompileResponse] =
    useState<SubmissionResult | null>(null);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const groupId = searchParams.get("id") as string;
  const currentUser = members.find((member) => member.uid === user?.uid);
  const debouncedCode = useDebounce(localCode, 1);

  const handleEditorDidMount = useCallback(
    (editor: monaco.editor.IStandaloneCodeEditor) => {
      editorRef.current = editor;
      SetupMonaco();
    },
    []
  );

  const { syncCode, emitCodeChange } = useCodeSync(
    socket,
    groupId,
    editorRef,
    setCode
  );

  useEffect(() => {
    syncCode();
  }, [syncCode]);

  useEffect(() => {
    if (isHost && debouncedCode !== code) {
      setCode(debouncedCode);
      if (groupId && editorRef.current) {
        const model = editorRef.current.getModel();
        emitCodeChange({
          delta: debouncedCode,
          range: model?.getFullModelRange() as monaco.Range,
        });
      }
    }
  }, [debouncedCode, isHost, groupId, emitCodeChange, code]);

  const handleEditorChange = (value: string | undefined) => {
    if (value === undefined || !isHost) return;
    setLocalCode(value);
  };

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

  useEffect(() => {
    if (groupId && currentUser) {
      setIsHost(currentUser.type === "Host");
    } else {
      setIsHost(true);
    }
  }, [currentUser, groupId]);

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
          options={{ readOnly: !isHost }}
        />
      </ResizablePanel>
      <ResizableHandle />
      {isOutputOpen && (
        <ResizablePanel defaultSize={25} className="border-gray-300">
          <CodeOutput Loading={isCompiling} result={compileResponse} />
        </ResizablePanel>
      )}
    </ResizablePanelGroup>
  );
}
