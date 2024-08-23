"use client";
import React, { useEffect } from "react";
import Home from "../page";
import { redirect, useSearchParams, useRouter } from "next/navigation";
import { useAuth, useSocket } from "@/context";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { useGroupsStore } from "@/zustand";
import { Events } from "@/components/constants";
export default function GroupPage() {
  const searchParams = useSearchParams();
  const groupId = searchParams.get("id") as string;
  const socket = useSocket();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const { setGroupId } = useGroupsStore();
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
      Events.GROUP.JOIN,
      groupId,
      user,
      async (response: {
        success: boolean;
        error?: string;
        audioToken: string;
      }) => {
        if (!response.success) {
          Error("Please Join Group by entering token in  join other section");
        }
      }
    );
  };
  if (!groupId) {
    redirect("/");
  }
  useEffect(() => {
    if (socket) {
      socket.emit(Events.GROUP.VALIDATE, groupId, (isValid: boolean) => {
        if (!isValid) {
          Error("Group is not exist");
          setTimeout(() => {
            router.push("/");
          }, 3000);
        } else {
          setGroupId(groupId);
          Rejoin();
        }
      });
    }
    return () => {
      socket?.off(Events.GROUP.VALIDATE);
    };
  }, [socket, groupId, router]);
  return <Home />;
}
