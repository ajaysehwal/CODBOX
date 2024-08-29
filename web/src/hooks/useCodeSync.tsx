import { useCallback } from "react";
import * as monaco from "monaco-editor";
import { CodeChange } from "@/components/interface";
import { useSocket } from "@/context";
import { Events } from "@/components/constants";

export const useCodeSync = (
  groupId: string,
  editorRef: React.RefObject<monaco.editor.IStandaloneCodeEditor>,
  setCode: (code: string) => void
) => {
  const { socket } = useSocket();
  const handleCodeUpdate = (response:any) => {
    console.log("updated",response);
    if (response) {
      setCode(response.updateCode);
      if (editorRef.current) {
        editorRef.current.setValue(response.updateCode);
      }
    }
  };

  const syncCode = useCallback(() => {
    if (!groupId || !socket) return;
    socket.emit(
      Events.GROUP.GET_FILE_CONTENT,
      groupId,
      (currentCode: string) => {
        console.log(Events.GROUP.GET_FILE_CONTENT, currentCode);
        setCode(currentCode);
        if (editorRef.current) {
          editorRef.current.setValue(currentCode);
        }
      }
    );
    socket.on(Events.GROUP.CODE_CHANGE, handleCodeUpdate);
    return () => {
      socket?.off(Events.GROUP.CODE_CHANGE, handleCodeUpdate);
    };
  }, [socket]);

  const emitCodeChange = (operation: CodeChange) => {
    if (!groupId || !socket) return;
    socket.emit(Events.GROUP.CODE_CHANGE, groupId, operation);
    return () => {
      socket.off(Events.GROUP.CODE_CHANGE);
    };
  };

  return { syncCode, emitCodeChange, handleCodeUpdate };
};
