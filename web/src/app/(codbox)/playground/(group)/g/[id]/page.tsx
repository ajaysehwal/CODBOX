"use client";
import React, { useEffect } from "react";
import { redirect, useParams, useRouter } from "next/navigation";
import { useAuth, useSocket } from "@/context";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Events } from "@/components/constants";
import Playground from "@/app/(codbox)/playground/page";

export default function GroupEnvironment() {
  const router = useRouter();
  const { id: groupId } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const { socket } = useSocket();

  if (!groupId) {
    redirect("/");
  }

  const showError = (error: string, description?: string) => {
    toast({
      variant: "destructive",
      title: error,
      description: description || "There was a problem with your request.",
      action: <ToastAction altText="Try again">Try again</ToastAction>,
    });
  };

  const rejoinGroup = () => {
    socket?.emit(
      Events.GROUP.JOIN,
      groupId,
      user,
      (response: { success: boolean; error?: string }) => {
        if (!response.success) {
          showError(
            "Please join the group by entering a token in the 'Join Other' section"
          );
        }
      }
    );
  };

  useEffect(() => {
    if (!socket) return;

    const validateGroup = () => {
      socket.emit(Events.GROUP.VALIDATE, groupId, (isValid: boolean) => {
        if (!isValid) {
          showError("Group does not exist");
          setTimeout(() => router.push("/"), 3000);
        } else {
          rejoinGroup();
        }
      });
    };

    validateGroup();

    return () => {
      socket?.off(Events.GROUP.VALIDATE);
    };
  }, [socket, groupId, router]);

  return <Playground />;
}
