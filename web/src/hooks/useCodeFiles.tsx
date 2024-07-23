import { useEffect, useState } from "react";
import { useAuth } from "../context";
import { useUserFileStore } from "../zustand";
import { GET, POST } from "../lib/api";
import { usePathname } from "next/navigation";

export function useCodeFile() {
  const { user } = useAuth();
  const { selectedFile, setSelectedFile } = useUserFileStore();
  const [fileCode, setfileCode] = useState<string>("");
  const pathname = usePathname();
  const { setFiles } = useUserFileStore();
  useEffect(() => {
    const getAllFiles = async (userId: string, filename: string) => {
      const result: any = await GET(`/file/${userId}/${filename}`);
      console.log(result);
      const fileCode = result.data?.content as string;
      if (result.data) {
        setfileCode(fileCode);
      }
    };

    if (selectedFile && user?.uid && pathname === "/") {
      getAllFiles(user.uid, selectedFile);
    }
  }, [selectedFile, user?.uid]);
  const createNewFile = async (filename: string) => {
    const result: any = await POST(`/file/create`, {
      userId: user?.uid,
      content: "",
      filename,
    });
    console.log(result)
    if (result.data) {
      setfileCode("");
      setSelectedFile(result.data.filename);
    }
  };
  const getAllFiles = async (userId: string) => {
    const result: any = await GET(`file/${userId}`);
    if (result.data) {
      const files = result.data.files as string[];
      setFiles(files);
    }
  };
  const getFileByFilename = async () => {
    const result: any = await GET(`/file/${user?.uid}/${selectedFile}`);
    console.log(result);
    const fileCode = result.data?.content as string;
    if (result.data) {
      setfileCode(fileCode);
    }
  };
  return { fileCode, createNewFile, getFileByFilename,getAllFiles };
}
