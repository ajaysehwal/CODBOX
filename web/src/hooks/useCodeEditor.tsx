import { useCallback, useRef, useState, useEffect } from "react";
import * as monaco from "monaco-editor";
import { useSocket, useAuth } from "../context";
import { useGroupsStore } from "../zustand";
import { useCodeSync } from "./useCodeSync";
import {
  DEFAULT_LANGUAGE,
  DEFAULT_THEME,
  DEFAULT_CODE,
} from "../components/constants";
import { useSearchParams } from "next/navigation";
import { Language, Theme } from "@/components/interface";
import SetupMonaco from "@/components/Editor/setUpMonaco";

export function useCodeEditor() {
  const searchParams = useSearchParams();
  const socket = useSocket();
  const { user } = useAuth();
  const { members } = useGroupsStore();
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE[0]);
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME[1]);
  const [isHost, setIsHost] = useState(false);
  const groupId = searchParams.get("id") as string;
  const editorCode = groupId ? "" : DEFAULT_CODE;
  const [code, setCode] = useState<string>(editorCode);
  const handleEditorDidMount = useCallback(
    (editor: monaco.editor.IStandaloneCodeEditor) => {
      editorRef.current = editor;
      SetupMonaco();
    },
    []
  );
  const { syncCode, emitCodeChange } = useCodeSync(
    groupId,
    editorRef,
    setCode
  );
  useEffect(() => {
    if (groupId && user) {
      const currentUser = members.find((member) => member.uid === user.uid);
      setIsHost(currentUser?.type === "Host");
    } else {
      setIsHost(true);
    }
  }, [members, user, groupId]);

  useEffect(() => {
    groupId && syncCode();
  }, [socket, groupId]);

  const handleEditorChange = (value: string | undefined) => {
    if (value === undefined) return;
    setCode(value);
    if (groupId && isHost && editorRef.current) {
      const model = editorRef?.current.getModel();
      emitCodeChange({
        delta: value,
        range: model?.getFullModelRange() as monaco.Range,
      });
    }
  };

  return {
    editorRef,
    language,
    theme,
    code,
    isHost,
    handleEditorDidMount,
    handleEditorChange,
    setLanguage,
    setTheme,
  };
}
