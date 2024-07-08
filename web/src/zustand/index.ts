import { create } from "zustand";
import { generateRandomToken } from "@/utils";

interface TokenState {
  token: string;
}
export const useInviteTokenStore = create<TokenState>((set) => ({
  token: generateRandomToken(16),
}));
