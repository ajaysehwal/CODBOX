"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth, useSocket } from "@/context";
import { useToast } from "../ui/use-toast";
import { ToastAction } from "../ui/toast";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { useGroupsStore } from "@/zustand";
import { Events } from "../constants";

interface LeaveGroupResponse {
  success: boolean;
  error: string;
}

export const LeaveGroup: React.FC = () => {
  const router = useRouter();
  const { id: groupId } = useParams<{ id: string }>();
  const { socket } = useSocket();
  const { toast } = useToast();
  const [isLeaving, setIsLeaving] = useState<boolean>(false);
  const { members, setMembers } = useGroupsStore();
  const { user } = useAuth();

  const showError = useCallback(
    (error: string) => {
      toast({
        variant: "destructive",
        title: error,
        description: "Please return to home page manually",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    },
    [toast]
  );

  const handleLeaveGroup = useCallback(() => {
    setIsLeaving(true);

    const leaveTimeout = setTimeout(() => {
      try {
        if (members.length === 1) {
          handleCloseGroup();
        } else {
          handleMemberLeave();
        }
        router.push("/playground");
      } catch (error) {
        showError("Error occurred while leaving group");
      } finally {
        setIsLeaving(false);
      }
    }, 500);

    return () => clearTimeout(leaveTimeout);
  }, [socket, router, members, groupId, user?.uid]);

  const handleCloseGroup = () => {
    socket?.emit("closeGroup", groupId, (result: boolean) => {
      if (!result) {
        showError("Error occurred while closing group");
      } else {
        setMembers([]);
      }
    });
  };

  const handleMemberLeave = () => {
    socket?.emit(
      Events.GROUP.LEAVE,
      groupId,
      user?.uid,
      (response: LeaveGroupResponse) => {
        if (!response.success) {
          showError(response.error);
        }
      }
    );
  };

  return (
    <Button
      disabled={isLeaving}
      onClick={handleLeaveGroup}
      className="bg-gradient-to-r from-red-400 to-red-600 text-white hover:from-red-500 hover:to-red-700 flex gap-2 items-center justify-center px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLeaving ? (
        <>
          <Spinner />
          <span>Leaving...</span>
        </>
      ) : (
        "Leave Group"
      )}
    </Button>
  );
};
