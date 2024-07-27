"use client";

import React, { useCallback, useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { useCodeEditor, useCodeFile, useCompilation } from "@/hooks";
import { EditorHeader } from "./header";
import { CodeOutput } from "./output";
import { ResizableEditor } from "../ui/ResizableEditor";
import { useBoxStore, useEditorToggle } from "@/zustand";
import debounce from "lodash/debounce";
import Whiteboard from "../whiteboard/board";

const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.default),
  { ssr: false }
);

export default function PersonalCodeEditor() {
  const {
    language,
    theme,
    handleEditorDidMount,
    handleEditorChange,
    setLanguage,
    setTheme,
  } = useCodeEditor();
  const { personalCode: initialPersonalCode, saveCode } = useCodeFile();

  const [personalCode, setPersonalCode] = useState(initialPersonalCode);
  const [isLoading, setIsLoading] = useState(true);
  
  const { isOutputOpen, isCompiling, compileResponse, evalCode } =
    useCompilation(personalCode, language);
  const { isBoxOpen } = useBoxStore();
  const { isEditorOpen } = useEditorToggle();

  const lastSavedCode = useRef(initialPersonalCode);

  useEffect(() => {
    if (initialPersonalCode !== undefined) {
      setPersonalCode(initialPersonalCode);
      setIsLoading(false);
    }
  }, [initialPersonalCode]);

  const debouncedSave = useCallback(
    debounce((code: string) => {
      if (code !== lastSavedCode.current) {
        saveCode(code);
        lastSavedCode.current = code;
      }
    }, 5000),
    [saveCode]
  );

  useEffect(() => {
    if (personalCode !== lastSavedCode.current) {
      debouncedSave(personalCode);
    }
  }, [personalCode, debouncedSave]);

  const handlePersonalCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      setPersonalCode(value);
      handleEditorChange(value);
    }
  };

  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  if (isLoading) {
    return <div>Loading...</div>;
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
            value={personalCode}
            onChange={handlePersonalCodeChange}
            onMount={handleEditorDidMount}
            options={{
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