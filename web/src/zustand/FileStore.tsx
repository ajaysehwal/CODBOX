import { create } from "zustand";
import { persist } from "zustand/middleware";

interface File {
  filename: string;
  content: string;
}

export interface FilesState {
  file: File | null;
  setFile: (file: File) => void;
  files: string[];
  setFiles: (files: string[]) => void;
  createLoad: boolean;
  setCreateLoad: (loading: boolean) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export const useFilesStore = create<FilesState>()(
  persist(
    (set) => ({
      file: null,
      setFile: (file: File) => set({ file }),
      files: [],
      setFiles: (files) => set({ files }),
      createLoad: false,
      setCreateLoad: (loading) => set({ createLoad: loading }),
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
      error: null,
      setError: (error) => set({ error }),
    }),
    { name: "filesStore" }
  )
);
