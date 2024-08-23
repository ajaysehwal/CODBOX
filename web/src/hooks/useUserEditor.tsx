import { useAuth, useSocket } from "@/context";
import { useCallback, useRef } from "react";
import * as monaco from "monaco-editor";
import { Events } from "@/components/constants";
import SetupMonaco from "@/components/Editor/setUpMonaco";
import { CodeChange } from "@/components/interface";
import { create } from "zustand";
import { useSearchParams } from "next/navigation";
import * as acorn from 'acorn';

interface CodeState {
  code: string;
  setCode: (code: string) => void;
}

export const useUserCode = create<CodeState>((set) => ({
  code: "",
  setCode: (code: string) => set({ code }),
}));

export const useUserEditor = () => {
  const { code, setCode } = useUserCode();
  const socket = useSocket();
  const searchParams = useSearchParams();
  const file = searchParams.get("file");
  const { user } = useAuth();
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEditorDidMount = useCallback(
    (editorInstance: monaco.editor.IStandaloneCodeEditor) => {
      editorRef.current = editorInstance;
      SetupMonaco();
    },
    []
  );

  const emitCodeChange = useCallback(
    (changes: CodeChange) => {
      if (!socket || !user || !file) return;
      socket.emit(Events.USER.CODE_CHANGE, user.uid, file, changes);
    },
    [socket, user, file]
  );

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (value === undefined) return;
      setCode(value);
      const ast = acorn.parse(value, { ecmaVersion: 2020 });
      console.log(ast);
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }

      debounceTimeout.current = setTimeout(() => {
        const editorInstance = editorRef.current;
        if (editorInstance) {
          const model = editorInstance.getModel();
          if (model) {
            emitCodeChange({
              delta: value,
              range: model.getFullModelRange(),
            });
          }
        }
      }, 1000);
    },
    [setCode, emitCodeChange]
  );
  
  return { code, handleEditorChange, handleEditorDidMount, setCode };
};
