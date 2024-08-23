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

interface ToggleStore {
  isChatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  isEditorOpen: boolean;
  setEditorOpen: (isEditorOpen: boolean) => void;
  isdrawerOpen: boolean;
  setIsDrawerOpen: (drawerOpen: boolean) => void;
  isOpenSearchBox: boolean;
  setIsOpenSearchBox: (isOpenSearchBox: boolean) => void;
}
export const useToggleStore = create<ToggleStore>((set) => ({
  isChatOpen: false,
  setChatOpen: (isChatOpen: boolean) => set({ isChatOpen }),
  isEditorOpen: false,
  setEditorOpen: (isEditorOpen: boolean) => set({ isEditorOpen }),
  isdrawerOpen: false,
  setIsDrawerOpen: (isdrawerOpen: boolean) => set({ isdrawerOpen }),
  isOpenSearchBox: false,
  setIsOpenSearchBox: (isOpenSearchBox: boolean) => set({ isOpenSearchBox }),
}));
