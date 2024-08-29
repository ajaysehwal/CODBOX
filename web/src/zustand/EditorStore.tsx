import { create } from "zustand";

export interface EditorState {
  code: string;
  setCode: (code: string) => void;
  isGroup: boolean;
  groupId?: string;
  file?: string | null;
  isHost: boolean;
  setIsHost: (isHost: boolean) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  code: "",
  setCode: (code: string) => set({ code }),
  isGroup: false,
  groupId: undefined,
  file: null,
  isHost: false,
  setIsHost: (isHost: boolean) => set({ isHost }),
}));
