import { useAuth, useSocket } from "@/context";
import { useCallback, useEffect, useState } from "react";
import { Events } from "@/components/constants";
import { create } from "zustand";
import { useRouter } from "next/navigation";
import { useUserEditor } from "./useUserEditor";
import { useGroupEditor } from "./useGroupEdior";
interface File {
  filename: string;
  content: string;
}

interface SelectedFile {
  file: File | null;
  setFile: (file: File) => void;
}
export const useSelectedFile = create<SelectedFile>((set) => ({
  file: null,
  setFile: (file: File) => set({ file }),
}));

interface CreateFileResponse {
  success: boolean;
  message: string;
}

const useFiles = (isGroup: boolean, groupId?: string) => {
  const [files, setFiles] = useState<string[]>([]);
  const { setCode } = isGroup ? useGroupEditor() : useUserEditor();

  const socket = useSocket();
  const { file, setFile } = useSelectedFile();
  const { user } = useAuth();
  const router = useRouter();
  const [createLoad, setcreateLoad] = useState<boolean>(false);
  const create = useCallback(
    (filename: string) => {
      setcreateLoad(true);
      const event = isGroup
        ? Events.GROUP.CREATE_FILE
        : Events.USER.CREATE_FILE;
      const ID = isGroup ? groupId : user?.uid;

      socket?.emit(
        event,
        ...[ID, filename],
        (_: any, response: CreateFileResponse) => {
          if (response.success) {
            setFiles((prev) => [...prev, filename]);
            setcreateLoad(false);
            selectFile(filename);
          } else {
            setcreateLoad(false);

            console.error("File creation failed:", response.message);
          }
        }
      );
    },
    [socket, isGroup, groupId]
  );

  const getFiles = useCallback(() => {
    const event = isGroup ? Events.GROUP.GET_FILES : Events.USER.GET_FILES;
    const ID = isGroup ? groupId : user?.uid;
    socket?.emit(event, ID, (_: any, files: string[]) => {
      setFiles(files);
    });
  }, [socket, isGroup, groupId]);

  useEffect(() => {
    getFiles();
    return () => {
      socket?.off(Events.GROUP.GET_FILES);
      socket?.off(Events.USER.GET_FILES);
    };
  }, [getFiles]);

  const selectFile = useCallback(
    (filename: string) => {
      const ID = isGroup ? groupId : user?.uid;
      const event = isGroup
        ? Events.GROUP.GET_FILE_CONTENT
        : Events.USER.GET_FILE_CONTENT;

      socket?.emit(event, ...[ID, filename], (_: any, content: string) => {
        console.log(content, filename);
        if (_) {
          router.push("/");
        } else {
          setFile({ filename, content });
          setCode(content);
        }
      });
    },
    [socket, isGroup, groupId]
  );

  return { create, files, selectFile, selectedFile: file, createLoad };
};

export const useUserFiles = () => useFiles(false);
export const useGroupFiles = (groupId: string) => useFiles(true, groupId);
