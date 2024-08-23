import { useAuth, useSocket } from "@/context";
import { useGroupsStore } from "@/zustand";
import { useEffect, useRef, useState } from "react";
import * as monaco from "monaco-editor";
import SetupMonaco from "@/components/Editor/setUpMonaco";
import { useSearchParams } from "next/navigation";
import { useCodeSync } from "./useCodeSync";

export const useGroupEditor = () => {
  const socket = useSocket();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const { members } = useGroupsStore();
  const [isHost, setIsHost] = useState(false);
  const groupId = searchParams.get("id") as string;
  const editor = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [code, setCode] = useState<string>("");
  const handleEditorDidMount = (e: monaco.editor.IStandaloneCodeEditor) => {
    editor.current = e;
    SetupMonaco();
  };
  const { syncCode, emitCodeChange } = useCodeSync(groupId, editor, setCode);
  useEffect(() => {
    if (groupId) {
      const currentUser = members.find((member) => member.uid === user?.uid);
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
    if (groupId && isHost && editor.current) {
      const model = editor?.current.getModel();
      emitCodeChange({
        delta: value,
        range: model?.getFullModelRange() as monaco.Range,
      });
    }
  };
  return {
    editor,
    isHost,
    handleEditorChange,
    handleEditorDidMount,
    code,
    setCode
  };
};
