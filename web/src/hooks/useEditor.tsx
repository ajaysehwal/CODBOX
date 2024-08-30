import { useAuth, useSocket } from "@/context";
import { useGroupsStore, useEditorStore } from "@/zustand";
import { useCallback, useEffect, useRef, useMemo, useState } from "react";
import * as monaco from "monaco-editor";
import SetupMonaco from "@/components/Editor/setUpMonaco";
import { useParams } from "next/navigation";
import { Events } from "@/components/constants";
import { CodeChange } from "@/components/interface";
import { debounce } from "lodash";
import { useHashRoute } from "./usehashRoute";

export const useEditor = () => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const { id: groupId } = useParams<{ id: string }>();
  const routefile = useHashRoute();
  const { members } = useGroupsStore();
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const { code, setCode, isGroup, isHost, setIsHost } = useEditorStore();
  useEffect(() => {
    useEditorStore.setState({
      isGroup: !!groupId,
      groupId,
      file: routefile as string,
    });
  }, [groupId, routefile]);

  useEffect(() => {
    if (groupId) {
      const currentUser = members.find((member) => member.uid === user?.uid);
      setIsHost(currentUser?.type === "Host");
    } else {
      setIsHost(true);
    }
  }, [members, user, groupId, setIsHost]);
  const handleEditorDidMount = useCallback(
    (editor: monaco.editor.IStandaloneCodeEditor) => {
      editorRef.current = editor;
      SetupMonaco();
    },
    []
  );

  const emitCodeChange = useCallback(
    (changes: CodeChange) => {
      if (!socket || !user) return;
      const event = isGroup
        ? Events.GROUP.CODE_CHANGE
        : Events.USER.CODE_CHANGE;
      const id = isGroup ? groupId : user.uid;
      socket.emit(event, id, routefile, changes);
    },
    [socket, user, isGroup, groupId, routefile]
  );

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (value === undefined) return;
      setCode(value);
      if ((!isGroup || isHost) && editorRef.current) {
        const model = editorRef.current.getModel();
        if (model) {
          emitCodeChange({
            delta: value,
            range: model.getFullModelRange(),
          });
        }
      }
    },
    [setCode, emitCodeChange, isGroup, isHost]
  );

  const syncCode = useCallback(() => {
    if (!socket || !groupId) return;
    socket.emit(
      Events.GROUP.GET_FILE_CONTENT,
      groupId,
      routefile,
      (_: any, content: string) => {
        setCode(content);
      }
    );
    socket.on(Events.GROUP.CODE_CHANGE, handleCodeUpdate);
    return () => {
      socket?.off(Events.GROUP.CODE_CHANGE, handleCodeUpdate);
    };
  }, [socket, groupId, routefile, setCode]);

  const handleCodeUpdate = (response: any) => {
    if (response) {
      const { content, filename } = response;
      setCode(content.updateCode);
      if (editorRef.current) {
        editorRef.current.setValue(content.updateCode);
      }
    }
  };
  useEffect(() => {
    if (isGroup) {
      syncCode();
    }
  }, [isGroup, syncCode]);

  return {
    editor: editorRef,
    isHost,
    handleEditorChange,
    handleEditorDidMount,
    code,
    setCode,
  };
};
