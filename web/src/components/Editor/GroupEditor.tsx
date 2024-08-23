"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useCompilation } from "@/hooks";
import { EditorHeader } from "./header";
import { CodeOutput } from "./output";
import { ResizableEditor } from "../ui/ResizableEditor";
import { useToggleStore } from "@/zustand";
import { useGroupEditor } from "@/hooks/useGroupEdior";
import { Language, Theme } from "../interface";
import { DEFAULT_LANGUAGE, DEFAULT_THEME } from "../constants";

const Whiteboard = dynamic(() => import("../whiteboard/board"), {
  ssr: false,
});

const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.default),
  { ssr: false }
);

export default function GroupEditor() {
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE[0]);
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME[1]);
  const { isHost, handleEditorChange, handleEditorDidMount, code } =
    useGroupEditor();
  const { isOutputOpen, isCompiling, compileResponse, evalCode } =
    useCompilation(code, language);
  const { isChatOpen, isEditorOpen } = useToggleStore();
  return (
    <ResizableEditor
      header={
        <EditorHeader
          theme={theme}
          language={language as Language}
          onThemeChange={setTheme}
          onLanguageChange={setLanguage}
          onEvalCode={evalCode}
          filename={'comming soon...'}
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
                enabled: !isChatOpen,
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
