"use client";
import { useAuth, useSocket } from "@/context";
import { useRouter } from "next/navigation";
import { useToast } from "../ui/use-toast";
import { useCallback, useState } from "react";
import { ToastAction } from "../ui/toast";
import { Button } from "../ui/button";
import { User } from "firebase/auth";
import { useGroupsStore } from "@/zustand";
import { Group } from "../interface";
import { Spinner } from "../ui/spinner";

interface Response {
  success: boolean;
  error?: string;
  audioToken: string;
  group: Group;
}
export const CreateGroup = ({
  Join,
}: {
  Join: (groupId: string, user: User, audioToken: string) => Promise<void>;
}) => {
  const router = useRouter();
  const socket = useSocket();
  const { toast } = useToast();
  const { user } = useAuth();
  const [createLoad, setCreateLoad] = useState<boolean>(true);
  const { setGroupId } = useGroupsStore();
  const createGroup = useCallback(() => {
    setCreateLoad(false);
    const id = setTimeout(() => {
      socket?.emit("createGroup", user, async (response: Response) => {
        console.log(response);
        if (response.success) {
          const group = response.group;
          setGroupId(group.id);
          await Join(group.id, user as User, response.audioToken);
          router.push(`/group?id=${group.id}`);
        } else {
          toast({
            variant: "destructive",
            title: response.error,
            description: "There was a problem with your request.",
            action: <ToastAction altText="Try again">Try again</ToastAction>,
          });
          setCreateLoad(true);
        }
      });
    }, 500);
    return () => clearTimeout(id);
  }, [socket, router]);
  return (
    <Button
      disabled={!createLoad}
      onClick={() => createGroup()}
      className="bg-gradient-to-r from-lime-300 to-lime-500 text-gray-800 hover:from-lime-400 hover:to-lime-600 flex gap-2 items-center justify-center px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-opacity-50 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {!createLoad ? (
        <>
          <Spinner />
          <span>Creating...</span>
        </>
      ) : (
        "Create Group"
      )}
    </Button>
  );
};
