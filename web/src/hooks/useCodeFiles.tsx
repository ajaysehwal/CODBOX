import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context";
import { useUserFileStore } from "../zustand";
import { GET, POST, PUT } from "../lib/api";
import { usePathname, useSearchParams } from "next/navigation";
import { toast, ToastOptions } from "react-toastify";

interface ApiResponse<T> {
  data: T | null;
  error: { message: string } | null;
}

export function useCodeFile() {
  const { user } = useAuth();
  const {
    selectedFile,
    setSelectedFile,
    addNewFile,
    setFiles,
    setPersonalCode,
    personalCode,
  } = useUserFileStore();
  const [fetchingContent, setFetchingContent] = useState<boolean>(false);
  const [createLoad, setCreateLoad] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const file = searchParams.get("file") as string;

  const toastOptions: ToastOptions = {
    autoClose: 6000,
    hideProgressBar: false,
    position: "top-left",
    pauseOnHover: true,
    progress: 0.2,
  };

  const handleError = useCallback(
    (error: string) => {
      toast.error(error, toastOptions);
    },
    [toastOptions]
  );

  const createNewFile = useCallback(
    async (filename: string) => {
      setCreateLoad(true);
      try {
        const result: ApiResponse<{ filename: string }> = await POST(
          `/file/create`,
          {
            userId: user?.uid,
            content: `// ${filename}`,
            filename,
          }
        );
        if (result.data) {
          addNewFile(filename);
          toast.success("File created successfully", toastOptions);
        } else {
          handleError(result.error?.message || "Failed to create file");
        }
      } catch (error) {
        handleError("An unexpected error occurred while creating the file");
      } finally {
        setCreateLoad(false);
      }
    },
    [user?.uid, addNewFile, handleError, toastOptions]
  );

  const getAllFiles = useCallback(
    async (userId: string) => {
      try {
        const result: ApiResponse<{ files: string[] }> = await GET(
          `file/${userId}`
        );
        if (result.data) {
          setFiles(result.data.files);
        } else {
          handleError(result.error?.message || "Failed to fetch files");
        }
      } catch (error) {
        handleError("An unexpected error occurred while fetching files");
      }
    },
    [setFiles, handleError]
  );

  const getFileContent = useCallback(
    async (filename: string) => {
      setFetchingContent(true);
      try {
        const result: ApiResponse<{ content: string }> = await GET(
          `/file/${user?.uid}/${filename}`
        );
        if (result.data) {
          setPersonalCode(result.data.content);
        } else {
          handleError(result.error?.message || "Failed to fetch file content");
        }
      } catch (error) {
        handleError("An unexpected error occurred while fetching file content");
      } finally {
        setFetchingContent(false);
      }
    },
    [user?.uid, setPersonalCode, handleError]
  );

  const saveCode = useCallback(
    async (code: string) => {
      setFetchingContent(true);
      try {
        const result: ApiResponse<{ success: boolean }> = await PUT(
          `/file/update/${user?.uid}/${selectedFile}`,
          { code }
        );
        if (!result.data) {
          handleError(result.error?.message || "Failed to save code");
        }
      } catch (error) {
        handleError("An unexpected error occurred while saving the code");
      } finally {
        setFetchingContent(false);
      }
    },
    [user?.uid, selectedFile]
  );

  useEffect(() => {
    if (user?.uid) {
      getAllFiles(user.uid);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (user?.uid) {
      getFileContent(file || selectedFile);
    }
  }, [file, selectedFile, user?.uid]);

  return {
    personalCode,
    createNewFile,
    getAllFiles,
    createLoad,
    getFileContent,
    fetchingContent,
    setPersonalCode,
    saveCode,
  };
}
