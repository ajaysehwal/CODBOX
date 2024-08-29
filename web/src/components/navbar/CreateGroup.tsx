"use client";

import { useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { User } from "firebase/auth";
import { useAuth, useSocket } from "@/context";
import { useToast } from "../ui/use-toast";
import { ToastAction } from "../ui/toast";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { Events } from "../constants";
import { Group } from "../interface";
import { useFiles } from "@/hooks";

interface CreateGroupProps {
  Join: (groupId: string, user: User) => Promise<void>;
}

interface CreateGroupResponse {
  success: boolean;
  error?: string;
  group: Group;
}

export const CreateGroup: React.FC<CreateGroupProps> = ({ Join }) => {
  const router = useRouter();
  const { socket } = useSocket();
  const { toast } = useToast();
  const { user } = useAuth();
  const { id: groupId } = useParams<{ id: string }>();

  const [isCreating, setIsCreating] = useState<boolean>(false);
  const { selectFile } = useFiles(groupId ? "group" : "user");
  const handleCreateGroup = useCallback(() => {
    setIsCreating(true);

    const createGroupTimeout = setTimeout(() => {
      socket?.emit(
        Events.GROUP.CREATE,
        user,
        async (response: CreateGroupResponse) => {
          if (response.success) {
            const { group } = response;
            await Join(group.id, user as User);
            router.push(`/playground/g/${group.id}#index.js`);
            selectFile('index.js', group.id);
          } else {
            showErrorToast(response.error);
            setIsCreating(false);
          }
        }
      );
    }, 500);

    return () => clearTimeout(createGroupTimeout);
  }, [socket, router, user, Join]);

  const showErrorToast = (error?: string) => {
    toast({
      variant: "destructive",
      title: error || "Error creating group",
      description: "There was a problem with your request.",
      action: <ToastAction altText="Try again">Try again</ToastAction>,
    });
  };

  return (
    <Button
      disabled={isCreating}
      onClick={handleCreateGroup}
      className="bg-gradient-to-r from-lime-300 to-lime-500 text-gray-800 hover:from-lime-400 hover:to-lime-600 flex gap-2 items-center justify-center px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-opacity-50 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isCreating ? (
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
