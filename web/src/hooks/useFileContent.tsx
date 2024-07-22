import { useEffect, useState } from "react";
import { useAuth } from "../context";
import { useUserFileStore } from "../zustand";
import { GET } from "../lib/api";
import { usePathname } from "next/navigation";

export function useFileContent() {
  const { user } = useAuth();
  const { selectedFile } = useUserFileStore();
  const [FileCode, setFileCode] = useState<string>("");
  const pathname = usePathname();
  useEffect(() => {
    const getFileContent = async (userId: string, filename: string) => {
      const result: any = await GET(`/file/${userId}/${filename}`);
      console.log(result);
      const fileCode = result.data?.content as string;
      if (result.data) {
        setFileCode(fileCode);
      }
    };

    if (selectedFile && user?.uid && pathname === "/") {
      getFileContent(user.uid, selectedFile);
    }
  }, [selectedFile, user?.uid]);

  return { FileCode };
}
