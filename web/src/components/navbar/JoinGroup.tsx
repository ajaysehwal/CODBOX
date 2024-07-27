"use client";
import { useAuth, useSocket } from "@/context";
import { useRouter } from "next/navigation";
import { useToast } from "../ui/use-toast";
import { useState, useCallback } from "react";
import { ToastAction } from "../ui/toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { User } from "firebase/auth";
import { Spinner } from "../ui/spinner";
import { ChevronDownIcon } from "lucide-react";
interface Response {
  success: boolean;
  error: string;
  token: string;
}
export const JoinGroup = ({
  Join,
}: {
  Join: (groupId: string, user: User, audioToken: string) => Promise<void>;
}) => {
  const router = useRouter();
  const socket = useSocket();
  const { user } = useAuth();
  const { toast } = useToast();
  const [joinLoad, setJoinLoad] = useState<boolean>(true);
  const [joiningToken, setJoiningToken] = useState<string>("");
  const Error = (error: string, desc?: string) => {
    return toast({
      variant: "destructive",
      title: error,
      description: desc,
      action: <ToastAction altText="Try again">Try again</ToastAction>,
    });
  };
  const JoinGroup = useCallback(
    (groupId: string) => {
      if (groupId === "") {
        Error("Invalid Token", "Please enter a valid token");
        setJoinLoad(true);
        return;
      }
      setJoinLoad(false);
      const id = setTimeout(() => {
        socket?.emit("joinGroup", groupId, user, async (response: Response) => {
          if (response.success) {
            await Join(groupId, user as User, response.token);
            router.push(`/group?id=${groupId}`);
          } else {
            Error(response.error);
            setJoinLoad(true);
          }
        });
      }, 1000);

      return () => clearTimeout(id);
    },
    [socket, router]
  );
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="bg-gradient-to-r from-gray-100 to-gray-300 dark:from-gray-700 dark:to-gray-900 text-gray-800 dark:text-white hover:from-gray-200 hover:to-gray-400 dark:hover:from-gray-600 dark:hover:to-gray-800 flex items-center justify-center px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 focus:ring-opacity-50 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-gray-300 dark:hover:border-gray-600">
        <span>Join Other</span>
        <ChevronDownIcon className="ml-2 h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-5 grid gap-2">
        <p className="text-sm text-gray-700">Enjoy coding with your friends</p>
        <Input
          placeholder="Enter your code"
          value={joiningToken}
          onChange={(e) => setJoiningToken(e.target.value)}
        />
        <Button
          onKeyPress={(e) => e.key === "Enter" && JoinGroup(joiningToken)}
          disabled={!joinLoad}
          onClick={() => JoinGroup(joiningToken)}
          className="bg-gradient-to-r from-green-400 to-green-600 text-white hover:from-green-500 hover:to-green-700 flex gap-2 items-center justify-center px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {!joinLoad ? (
            <>
              <Spinner />
              <span>Joining...</span>
            </>
          ) : (
            "Join"
          )}
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
