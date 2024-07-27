import { create } from "zustand";
import { User } from "firebase/auth";
export interface GroupUser extends User {
  type: string;
}
interface Members {
  members: GroupUser[];
  groupId: string;
  setMembers: (members: GroupUser[]) => void;
  setGroupId: (groupId: string) => void;
  setNewGroupMember: (member: GroupUser) => void;
  removeMember: (memberId: string) => void;
}
export const useGroupsStore = create<Members>((set) => ({
  members: [],
  groupId: "",
  setMembers: (members: GroupUser[]) => set({ members }),
  setGroupId: (groupId: string) => set({ groupId }),
  setNewGroupMember: (member: GroupUser) =>
    set((state) => {
      const isExist = state.members.some((m) => m.uid === member.uid);
      if (!isExist) {
        return { members: [...state.members, member] };
      }
      return state;
    }),
  removeMember: (memberId) =>
    set((state) => ({
      members: state.members.filter((member) => member.uid !== memberId),
    })),
}));

interface UserFile {
  files: string[];
  setFiles: (files: string[]) => void;
  selectedFile: string;
  setSelectedFile: (selectedFile: string) => void;
  addNewFile: (file: string) => void;
  personalCode: string;
  setPersonalCode: (personalCode: string) => void;
}
export const useUserFileStore = create<UserFile>((set) => ({
  files: [],
  setFiles: (files: string[]) => set({ files }),
  selectedFile: "index.js",
  setSelectedFile: (selectedFile: string) => set({ selectedFile }),
  addNewFile: (file: string) =>
    set((state) => {
      const isExist = state.files.some((el) => el === file);
      if (!isExist) {
        return { files: [...state.files, file] };
      }
      return state;
    }),
  removeFile: (fileId: number) =>
    set((state) => ({
      files: state.files.filter((_, i) => i !== fileId),
    })),
  personalCode: "",
  setPersonalCode: (personalCode: string) => set({ personalCode }),
}));

interface BoxStore {
  isBoxOpen: boolean;
  setBoxOpen: (open: boolean) => void;
}
export const useBoxStore = create<BoxStore>((set) => ({
  isBoxOpen: false,
  setBoxOpen: (isBoxOpen: boolean) => set({ isBoxOpen }),
}));

interface EditorToogle {
  isEditorOpen: boolean;
  setEditorOpen: (isEditorOpen: boolean) => void;
}

export const useEditorToggle = create<EditorToogle>((set) => ({
  isEditorOpen: false,
  setEditorOpen: (isEditorOpen: boolean) => set({ isEditorOpen }),
}));

interface DrawerStore {
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}
export const useDrawerStore = create<DrawerStore>((set) => ({
  drawerOpen: false,
  setDrawerOpen: (drawerOpen: boolean) => set({ drawerOpen }),
}));
