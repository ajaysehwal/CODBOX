"use client";
import { useAuth, useSocket, useZegoEngine } from "@/context";
import { useSearchParams, useRouter } from "next/navigation";
import { useToast } from "../ui/use-toast";
import { useState, useCallback } from "react";
import { ToastAction } from "../ui/toast";
import { Button } from "../ui/button";
import ZegoLocalStream from "zego-express-engine-webrtc/sdk/code/zh/ZegoLocalStream.web";
import { useGroupsStore } from "@/zustand";
import { Spinner } from "../ui/spinner";
interface Response {
  success: boolean;
  error: string;
}
export const LeaveGroup = ({
  localStream,
}: {
  localStream: ZegoLocalStream | null;
}) => {
  const searchParams = useSearchParams();
  const groupId = searchParams.get("id") as string;
  const router = useRouter();
  const socket = useSocket();
  const { toast } = useToast();
  const [LeaveLoad, setLeaveLoad] = useState<boolean>(true);
  const { zegoEngine } = useZegoEngine();
  const { members, removeMember, setMembers } = useGroupsStore();
  const { user } = useAuth();
  const LeaveGroup = useCallback(
    (groupId: string) => {
      setLeaveLoad(false);
      console.log(members.length === 1);
      const id = setTimeout(() => {
        try {
          if (members.length === 1) {
            socket?.emit("closeGroup", groupId, (result: boolean) => {
              if (!result) {
                Error("Error Occured while closing group");
              } else {
                setMembers([]);
              }
            });
          } else {
            socket?.emit(
              "leaveGroup",
              groupId,
              user?.uid,
              (response: Response) => {
                if (!response.success) {
                  Error(response.error);
                }
              }
            );
          }
          router.push("/");
          disconnectAudio(groupId);
        } catch (error) {
          Error("Error Occured while leaving group");
        } finally {
          setLeaveLoad(true);
        }
      }, 500);
      return () => clearTimeout(id);
    },

    [socket, router]
  );
  const disconnectAudio = useCallback(
    async (groupId: string) => {
      if (zegoEngine && localStream) {
        zegoEngine.destroyStream(localStream);
        zegoEngine.logoutRoom(groupId);
      }
    },
    [localStream, groupId, zegoEngine]
  );
  const Error = (error: string) => {
    return toast({
      variant: "destructive",
      title: error,
      description: "Please return home page manually",
      action: <ToastAction altText="Try again">Try again</ToastAction>,
    });
  };
  return (
    <Button
      disabled={!LeaveLoad}
      onClick={() => LeaveGroup(groupId)}
      className="bg-gradient-to-r from-red-400 to-red-600 text-white hover:from-red-500 hover:to-red-700 flex gap-2 items-center justify-center px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {!LeaveLoad ? (
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
