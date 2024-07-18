import { create } from "zustand";
import { generateRandomToken } from "@/utils";
import { User } from "firebase/auth";
export interface GroupUser extends User {
  type: string;
}
interface TokenState {
  token: string;
}
export const useInviteTokenStore = create<TokenState>((set) => ({
  token: generateRandomToken(16),
}));
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
    set((state) => ({
      members: [...state.members, member],
    })),
  removeMember: (memberId) =>
    set((state) => ({
      members: state.members.filter((member) => member.uid !== memberId),
    })),
}));
