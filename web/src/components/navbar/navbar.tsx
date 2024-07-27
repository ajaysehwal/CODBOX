"use client";
import React, { useState, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useGroupsStore } from "@/zustand";
import { Account, JoinGroup, CreateGroup, LeaveGroup, Invite } from ".";
import { useAuth, useSocket, useZegoEngine } from "@/context";
import ZegoLocalStream from "zego-express-engine-webrtc/sdk/code/zh/ZegoLocalStream.web";
import { User } from "firebase/auth";
import { useToast } from "../ui/use-toast";
import { ToastAction } from "../ui/toast";
import GoogleSignIn from "./signIn";
import {
  Menubar,
  MenubarContent,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { MessageCircleMore } from "lucide-react";
import ChatSection from "../chat/chat";
import { Button } from "../ui/button";
export default function Navbar() {
  const path = usePathname().trim();
  const socket = useSocket();
  const searchParams = useSearchParams();
  const groupId = searchParams.get("id") as string;
  const { user } = useAuth();
  const { zegoEngine } = useZegoEngine();
  const [localStream, SetLocalStream] = useState<ZegoLocalStream | null>(null);
  const { toast } = useToast();

  const Join = useCallback(
    async (groupId: string, user: User, audioToken: string) => {
      if (groupId && user) {
        try {
          voiceConnection(groupId, audioToken, user);
        } catch (error) {
          toast({
            variant: "destructive",
            title: JSON.stringify(error),
            description: "Unable to Join Group",
            action: <ToastAction altText="Try again">Try again</ToastAction>,
          });
        }
      }
    },
    [socket, zegoEngine, groupId]
  );
  const voiceConnection = async (
    groupId: string,
    token: string,
    user: User
  ) => {
    if (zegoEngine) {
      await zegoEngine.loginRoom(groupId, token, {
        userID: user?.uid as string,
        userName: user?.email as string,
      });
      const localStream = await zegoEngine.createZegoStream({
        camera: { audio: true, video: false },
        audioBitrate: 192,
        autoPlay: true,
      });
      SetLocalStream(localStream);
      zegoEngine.startPublishingStream(`${user?.uid}_stream`, localStream);
    }
  };
  return (
    <header className="flex flex-wrap md:justify-start md:flex-nowrap z-50 w-full h-[10vh]">
      <nav
        className="relative max-w-7xl w-full flex flex-wrap justify-around basis-full items-center px-4 md:px-6 mx-auto"
        aria-label="Global"
      >
        <div className="md:col-span-3">
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
            Code<span className="text-blue-500">XF</span>
          </h1>
        </div>
        <div className="flex items-center gap-x-2 py-1 ms-auto md:ps-6 md:order-3 md:col-span-3">
          {!user ? (
            <GoogleSignIn />
          ) : (
            <>
              {path !== "/group" && <JoinGroup Join={Join} />}
              {path === "/group" ? (
                <>
                  <Invite />
                  <LeaveGroup localStream={localStream} />
                  <div className="block lg:hidden">
                    <Menubar>
                      <MenubarMenu>
                        <MenubarTrigger>
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full p-2 border-2 border-blue-200 bg-white hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 ease-in-out shadow-sm hover:shadow-md focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
                          >
                            <MessageCircleMore className="w-6 h-6 text-blue-500 hover:text-blue-600 transition-colors duration-300" />
                          </Button>
                        </MenubarTrigger>
                        <MenubarContent className="w-[350px]">
                          <ChatSection />
                        </MenubarContent>
                      </MenubarMenu>
                    </Menubar>
                  </div>
                </>
              ) : (
                <CreateGroup Join={Join} />
              )}
              <Account />
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
