"use client";
import React, { useEffect } from "react";
import Home from "../page";
import { redirect, useSearchParams, useRouter } from "next/navigation";
import { useAuth, useSocket } from "@/context";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { ZegoEngine } from "@/lib/zegocloud";

const GroupPage: React.FC = () => {
  const searchParams = useSearchParams();
  const socket = useSocket();
  const router = useRouter();
  const { toast } = useToast();
  const zg = ZegoEngine();
  const groupId = searchParams.get("id") as string;
  const { user } = useAuth();
  const Error = (error: string, desc?: string) => {
    toast({
      variant: "destructive",
      title: error,
      description: desc ? desc : "There was a problem with your request.",
      action: <ToastAction altText="Try again">Try again</ToastAction>,
    });
  };
  const Rejoin = () => {
    socket?.emit(
      "joinGroup",
      groupId,
      user,
      async (response: {
        success: boolean;
        error?: string;
        AudioToken: string;
      }) => {
        if (!response.success) {
          Error("Please Join Group by entering token in  join other section");
        } else {
          if (zg) {
            await zg.loginRoom(groupId, response.AudioToken, {
              userID: user?.uid as string,
              userName: user?.email as string,
            });
            const localStream = await zg.createZegoStream({
              camera: { audio: true, video: false },
              audioBitrate: 192,
            });
            zg.startPublishingStream(`${user?.uid}_stream`, localStream);
          }
        }
      }
    );
  };
  useEffect(() => {
    if (socket) {
      socket.emit("IsGroupValid", groupId);
      socket.on("IsGroupValid", (isValid: boolean) => {
        if (!isValid) {
          Error("Group is not exist");
          setTimeout(() => {
            router.push("/");
          }, 3000);
        } else {
          Rejoin();
        }
      });
    }
    return () => {
      socket?.off("IsGroupValid");
    };
  }, [socket, groupId, router]);
  if (!groupId || groupId.trim().length !== 16) {
    redirect("/");
  }
  return <Home />;
};
export default GroupPage;
