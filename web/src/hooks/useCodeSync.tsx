import { useCallback, useRef } from "react";
import * as monaco from "monaco-editor";
import { Socket } from "socket.io-client";
import { CodeChange } from "@/components/interface";

export const useCodeSync = (
  socket: Socket | null,
  groupId: string,
  editorRef: React.RefObject<monaco.editor.IStandaloneCodeEditor>,
  setCode: React.Dispatch<React.SetStateAction<string>>
) => {
  const isInitialSync = useRef(true);
  const isLocalChange = useRef(false);

  const handleCodeUpdate = useCallback(
    (response: { updatedCode: string; change: CodeChange }) => {
      if (response) {
        setCode(response.updatedCode);
      }
    },
    [editorRef, setCode]
  );

  const syncCode = useCallback(() => {
    if (!groupId || !socket) return;

    if (isInitialSync.current) {
      socket.emit("codeTemplate", groupId, (initialCode: string) => {
        setCode(initialCode);
        if (editorRef.current) {
          editorRef.current.setValue(initialCode);
        }
        isInitialSync.current = false;
      });
    }

    socket.on("codeUpdate", handleCodeUpdate);

    return () => {
      socket.off("codeUpdate", handleCodeUpdate);
    };
  }, [socket, groupId, editorRef, setCode, handleCodeUpdate]);

  const emitCodeChange = useCallback(
    (operation: CodeChange) => {
      if (!groupId || !socket) return;
      isLocalChange.current = true;
      socket.emit("codeChange", groupId, operation);
      setTimeout(() => {
        isLocalChange.current = false;
      }, 0);
    },
    [socket, groupId]
  );

  return { syncCode, emitCodeChange };
};
