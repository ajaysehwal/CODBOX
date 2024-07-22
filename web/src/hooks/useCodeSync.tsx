import { SetStateAction, useCallback, useState } from "react";
import * as monaco from "monaco-editor";
import { Socket } from "socket.io-client";
import { CodeChange } from "@/components/interface";

export const useCodeSync = (
  socket: Socket | null,
  groupId: string,
  editorRef: React.RefObject<monaco.editor.IStandaloneCodeEditor>,
  setCode: React.Dispatch<SetStateAction<string>>
) => {
  const handleCodeUpdate = (response: {
    updateCode: string;
    change: CodeChange;
  }) => {
    if (response) {
      setCode(response.updateCode);
      if (editorRef.current) {
        editorRef.current.setValue(response.updateCode);
      }
    }
  };

  const syncCode = useCallback(() => {
    if (!groupId || !socket) return;
    socket.emit("currentCode", groupId, (currentCode: string) => {
      console.log("currentCode", currentCode);
      setCode(currentCode);
      if (editorRef.current) {
        editorRef.current.setValue(currentCode);
      }
    });
    socket.on("onCodeChange", handleCodeUpdate);
    return () => {
      socket?.off("onCodeChange", handleCodeUpdate);
    };
  }, [socket]);

  const emitCodeChange = (operation: CodeChange) => {
    if (!groupId || !socket) return;
    socket.emit("onCodeChange", groupId, operation);
    return () => {
      socket.off("onCodeChange");
    };
  };

  return { syncCode, emitCodeChange, handleCodeUpdate };
};
