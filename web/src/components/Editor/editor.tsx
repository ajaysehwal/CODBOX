"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useCodeEditor, useCodeFile, useCompilation } from "@/hooks";
import { EditorHeader } from "./header";
import { CodeOutput } from "./output";
import { ResizableEditor } from "../ui/ResizableEditor";
import { useBoxStore, useEditorToggle } from "@/zustand";

const Whiteboard = dynamic(() => import("../whiteboard/board"), {
  ssr: false,
});

const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.default),
  { ssr: false }
);

export default function Editor() {
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
  const { isEditorOpen } = useEditorToggle();
  const { fileCode } = useCodeFile();
 
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
        isEditorOpen ? (
          <Whiteboard />
        ) : (
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
        )
      }
      output={
        isOutputOpen && (
          <CodeOutput Loading={isCompiling} result={compileResponse} />
        )
      }
    />
  );
}
