"use client";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import Image from "next/image";

import { useAuth } from "@/context";
export const Account = () => {
  const { user, logout } = useAuth();
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>
          <Image
            className="rounded-full"
            src={user?.photoURL as string}
            alt=""
            width={40}
            height={40}
          />
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Account</MenubarItem>
          <MenubarSeparator />
          <MenubarItem onClick={() => logout()}>Logout</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
};
