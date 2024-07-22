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
interface UserFile {
  files: string[];
  setFiles: (files: string[]) => void;
  selectedFile: string;
  setSelectedFile: (selectedFile: string) => void;
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

export const useUserFileStore = create<UserFile>((set) => ({
  files: [],
  setFiles: (files: string[]) => set({ files }),
  selectedFile: "index.js",
  setSelectedFile: (selectedFile: string) => set({ selectedFile }),
}));

interface BoxStore {
  isBoxOpen: boolean;
  setBoxOpen: (open: boolean) => void;
}
export const useBoxStore = create<BoxStore>((set) => ({
  isBoxOpen: false,
  setBoxOpen: (isBoxOpen: boolean) => set({ isBoxOpen }),
}));
