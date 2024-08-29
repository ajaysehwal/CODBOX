"use client";

import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import dynamic from "next/dynamic";
import { usePathname, useSearchParams } from "next/navigation";
import { useCompilation, useEditor, useFiles } from "@/hooks";
import { useToggleStore } from "@/zustand";
import { EditorHeader } from "./header";
import { CodeOutput } from "./output";
import { ResizableEditor } from "../ui/ResizableEditor";
import InitGroupFile from "../Searching/InitGroupFile";
import { getLanguageByExtension } from "@/utils";
import { DEFAULT_THEME } from "../constants";
import { Theme, Result } from "../interface";
import { editor } from "monaco-editor";
import { debounce } from "lodash";
import { useHashRoute } from "@/hooks/usehashRoute";

const Whiteboard = dynamic(() => import("../whiteboard/board"), { ssr: false });
const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.default),
  { ssr: false }
);

interface CodeEditorProps {
  isGroup?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ isGroup = false }) => {
  const routeFile = useHashRoute();
  const [isSetUpFile, setSetUpFile] = useState(false);
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME[1]);

  const { file, files, createFile } = useFiles(isGroup ? "group" : "user");
  const { isHost, handleEditorChange, handleEditorDidMount, code } =
    useEditor();
  const { isChatOpen, isEditorOpen } = useToggleStore();

  const language = useMemo(() => {
    const filename = file?.filename || routeFile || "index.js";
    return getLanguageByExtension(filename);
  }, [file?.filename, routeFile]);

  const { isOutputOpen, isCompiling, result, execute } = useCompilation(
    code || (file?.content as string),
    language
  );

  const handleCreateFile = useCallback(
    (fileName: string) => {
      createFile(fileName);
      setSetUpFile(false);
    },
    [createFile]
  );

  const editorOptions: editor.IStandaloneEditorConstructionOptions = useMemo(
    () => ({
      readOnly: isGroup && !isHost,
      glyphMargin: true,
      minimap: { enabled: !isChatOpen },
      hover: { enabled: true },
      scrollbar: { vertical: "hidden" as const },
    }),
    [isGroup, isHost, isChatOpen]
  );

  const Editor = useMemo(() => {
    if (isEditorOpen) {
      return <Whiteboard />;
    }
    return (
      <MonacoEditor
        height="85vh"
        language={language}
        theme={theme}
        value={code || (routeFile ? (file?.content as string) : "")}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={editorOptions}
      />
    );
  }, [
    isEditorOpen,
    language,
    theme,
    code,
    routeFile,
    file?.content,
    handleEditorChange,
    handleEditorDidMount,
    editorOptions,
  ]);

  const Output = useMemo(() => {
    return <CodeOutput Loading={isCompiling} result={result as Result} />;
  }, [isCompiling, result]);

  useEffect(() => {
    if (isGroup && files && files.length === 0) {
      setSetUpFile(true);
    }
  }, [isGroup, files]);

  return (
    <>
      <ResizableEditor
        header={
          <EditorHeader
            theme={theme}
            isGroup={isGroup}
            onThemeChange={setTheme}
            onEvalCode={execute}
            filename={file?.filename || "Select File"}
          />
        }
        editor={Editor}
        output={isOutputOpen && Output}
      />
      {isGroup && (
        <InitGroupFile
          isOpen={isSetUpFile}
          onClose={() => setSetUpFile(false)}
          createFile={handleCreateFile}
        />
      )}
    </>
  );
};

export default CodeEditor;
