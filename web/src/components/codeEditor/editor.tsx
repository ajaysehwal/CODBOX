import React, { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { SubmissionResult, Response } from "../interface";
import * as monaco from "monaco-editor";
import { useAuth, useSocket } from "@/context";
import { useToast } from "../ui/use-toast";
import { ToastAction } from "../ui/toast";
import { CodeOutput } from "./output";
import { EditorHeader } from "./header";
import { setupMonaco } from "./setUpMonaco";
import { Language, Theme, CodeChange } from "../interface";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { useSearchParams } from "next/navigation";

export default function CodeEditor() {
  const searchParams = useSearchParams();
  const [language, setLanguage] = useState<Language>("javascript");
  const [theme, setTheme] = useState<Theme>("light");
  const groupId = searchParams.get("id") as string;
  const socket = useSocket();
  const { user } = useAuth();
  const { toast } = useToast();
  const [code, setCode] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [compileResponse, setCompileResponse] =
    useState<SubmissionResult | null>(null);
  const [compileLoad, setCompileLoad] = useState<boolean>(true);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const handleEditorDidMount = (
    editor: monaco.editor.IStandaloneCodeEditor
  ) => {
    editorRef.current = editor;
    setupMonaco();
  };
  const errorToast = (error: string | undefined) => {
    return toast({
      variant: "destructive",
      title: error,
      description: "There was a problem with your request.",
      action: <ToastAction altText="Try again">Try again</ToastAction>,
    });
  };
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
      if (groupId && editorRef.current) {
        const model = editorRef.current.getModel();
        if (model) {
          const change = {
            delta: value,
            range: model.getFullModelRange(),
          };
          socket?.emit("codeChange", groupId, change);
        }
      }
    }
  };
  const handleThemeChange = (value: Theme) => {
    setTheme(value);
  };
  const handleLanguageChange = (value: Language) => {
    setLanguage(value);
  };
  const evalCode = () => {
    setCompileLoad(false);
    setOpen(true);
    const evalRequest = {
      source_code: code,
      language: language,
      user_id: user?.uid,
    };
    socket?.emit("evalcode", evalRequest, (response: Response) => {
      if (!response.success) {
        errorToast(response.error);
      }
      if (response.result) {
        setCompileResponse(response.result);
        setCompileLoad(true);
      } else {
        setOpen(false);
        errorToast("Internal Server error");
      }
    });
  };
  useEffect(() => {
    if (groupId && socket) {
      socket?.emit("codeTemplate", groupId, (initialCode: string) => {
        setCode(initialCode);
        if (editorRef.current) {
          editorRef.current.setValue(initialCode);
        }
      });
      socket?.on(
        "codeUpdate",
        (response: { updatedCode: string; change: CodeChange }) => {
          setCode(response.updatedCode);
        }
      );
    }
    return () => {
      socket?.off("codeUpdate");
    };
  }, [socket, groupId]);

  return (
    <>
      <ResizablePanelGroup direction="vertical" className="w-full ">
        <ResizablePanel defaultSize={75}>
          <EditorHeader
            theme={theme}
            language={language}
            onThemeChange={handleThemeChange}
            onLanguageChange={handleLanguageChange}
            onEvalCode={evalCode}
          />
          <Editor
            height="85vh"
            language={language}
            theme={theme}
            value={code}
            defaultValue="/**
                        * SyncCode - A platform for seamless collaboration in coding.
                        * Connect, code, and create together in real-time!
                                    */"
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
          />
        </ResizablePanel>
        <ResizableHandle />
        {open && (
          <ResizablePanel defaultSize={25} className="border-gray-300">
            {open && (
              <CodeOutput
                setOpen={setOpen}
                Loading={compileLoad}
                result={compileResponse}
                setCompileResponse={setCompileResponse}
              />
            )}
          </ResizablePanel>
        )}
      </ResizablePanelGroup>
    </>
  );
}
