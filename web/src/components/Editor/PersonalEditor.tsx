// import React, { useEffect, useState, useCallback, useMemo } from "react";
// import dynamic from "next/dynamic";
// import { useSearchParams } from "next/navigation";
// import { useFiles, useCompilation, useEditor } from "@/hooks";
// import { useToggleStore } from "@/zustand";
// import { EditorHeader } from "./header";
// import { CodeOutput } from "./output";
// import { ResizableEditor } from "../ui/ResizableEditor";
// import Whiteboard from "../whiteboard/board";
// import { Language, Result, Theme } from "../interface";
// import { DEFAULT_THEME } from "../constants";
// import { getLanguageByExtension } from "@/utils";

// const MonacoEditor = dynamic(
//   () => import("@monaco-editor/react").then((mod) => mod.default),
//   { ssr: false }
// );

// interface File {
//   filename: string;
//   content: string;
// }

// interface EditorProps {
//   language: Language;
//   theme: Theme;
//   code: string;
//   onEditorChange: (value: string | undefined) => void;
//   onEditorMount: (editor: any, monaco: any) => void;
// }

// const Editor: React.FC<EditorProps> = ({
//   language,
//   theme,
//   code,
//   onEditorChange,
//   onEditorMount,
// }) => (
//   <MonacoEditor
//     height="85vh"
//     language={language}
//     theme={theme}
//     value={code}
//     onChange={onEditorChange}
//     onMount={onEditorMount}
//     options={{
//       glyphMargin: true,
//       hover: { enabled: true },
//       scrollbar: { vertical: "hidden" },
//     }}
//   />
// );

// const PersonalCodeEditor: React.FC = () => {
//   const searchParams = useSearchParams();
//   const file = searchParams.get("file");
//   const { selectFile, selectedFile } = useFiles();
//   const { handleEditorDidMount, handleEditorChange, code } = useEditor();
//   const { isEditorOpen } = useToggleStore();
//   const language = useMemo(
//     () =>
//       getLanguageByExtension((selectedFile?.filename as string) || "index.js"),
//     [selectedFile]
//   );
//   const [theme, setTheme] = useState<Theme>(DEFAULT_THEME[1]);

//   useEffect(() => {
//     if (file) {
//       selectFile(file);
//     }
//   }, [selectFile, file]);

//   const { isOutputOpen, isCompiling, execute, result } = useCompilation(
//     code,
//     language
//   );

//   const renderEditor = useCallback(() => {
//     if (isEditorOpen) return <Whiteboard />;

//     return (
//       <Editor
//         language={language as Language}
//         theme={theme}
//         code={code}
//         onEditorChange={handleEditorChange}
//         onEditorMount={handleEditorDidMount}
//       />
//     );
//   }, [
//     isEditorOpen,
//     language,
//     theme,
//     selectedFile,
//     handleEditorChange,
//     handleEditorDidMount,
//   ]);

//   return (
//     <>
//       <ResizableEditor
//         header={
//           <EditorHeader
//             theme={theme}
//             onThemeChange={setTheme}
//             onEvalCode={execute}
//             filename={selectedFile?.filename || ""}
//           />
//         }
//         editor={renderEditor()}
//         output={
//           isOutputOpen && (
//             <CodeOutput Loading={isCompiling} result={result as Result} />
//           )
//         }
//       />
//     </>
//   );
// };

// export default PersonalCodeEditor;
