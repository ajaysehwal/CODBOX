"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useCodeEditor } from "../../hooks/useCodeEditor";
import { EditorHeader } from "./header";
import { CodeOutput } from "./output";
import { ResizableEditor } from "../ui/ResizableEditor";
import { useCompilation } from "../../hooks/useCompilation";
import { useFileContent } from "../../hooks/useFileContent";
import { useBoxStore } from "@/zustand";

const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.default),
  { ssr: false }
);

export default function CodeEditor() {
  const {
    language,
    theme,
    isHost,
    code,
    handleEditorDidMount,
    handleEditorChange,
    setLanguage,
    setTheme,
  } = useCodeEditor();
  const { isOutputOpen, isCompiling, compileResponse, evalCode } =
    useCompilation(code, language);
  const { isBoxOpen } = useBoxStore();
  return (
    <ResizableEditor
      header={
        <EditorHeader
          theme={theme}
          language={language}
          onThemeChange={setTheme}
          onLanguageChange={setLanguage}
          onEvalCode={evalCode}
        />
      }
      editor={
        <MonacoEditor
          height="85vh"
          language={language}
          theme={theme}
          value={code}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            readOnly: !isHost,
            glyphMargin: true,
            minimap: {
              enabled: !isBoxOpen,
            },
            hover: {
              enabled: true,
            },
            scrollbar: {
              vertical: "hidden",
            },
          }}
        />
      }
      output={
        isOutputOpen && (
          <CodeOutput Loading={isCompiling} result={compileResponse} />
        )
      }
    />
  );
}
