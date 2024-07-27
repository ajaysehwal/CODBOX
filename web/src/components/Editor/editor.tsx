"use client";
import React from "react";
import dynamic from "next/dynamic";
import { useCodeEditor, useCompilation } from "@/hooks";
import { EditorHeader } from "./header";
import { CodeOutput } from "./output";
import { ResizableEditor } from "../ui/ResizableEditor";
import { useBoxStore, useEditorToggle } from "@/zustand";
import { usePathname } from "next/navigation";
import PersonalCodeEditor from "./PersonalEditor";

const Whiteboard = dynamic(() => import("../whiteboard/board"), {
  ssr: false,
});

const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.default),
  { ssr: false }
);

export default function Editor() {
  const pathname = usePathname();

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
  if (pathname === "/") {
    return <PersonalCodeEditor />;
  }
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
