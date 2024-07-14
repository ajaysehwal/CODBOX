import { create } from "zustand";
import { generateRandomToken } from "@/utils";
import { User } from "firebase/auth";

interface TokenState {
  token: string;
}
export const useInviteTokenStore = create<TokenState>((set) => ({
  token: generateRandomToken(16),
}));
interface Members {
  members: User[];
  groupId: string;
  setMembers: (members: User[]) => void;
  setGroupId: (groupId: string) => void;
  setNewGroupMember: (member: User) => void;
  removeMember: (memberId: string) => void;
}
export const useGroupsStore = create<Members>((set) => ({
  members: [],
  groupId: "",
  setMembers: (members: User[]) => set({ members }),
  setGroupId: (groupId: string) => set({ groupId }),
  setNewGroupMember: (member: User) =>
    set((state) => ({
      members: [...state.members, member],
    })),
  removeMember: (memberId) =>
    set((state) => ({
      members: state.members.filter((member) => member.uid !== memberId),
    })),
}));
