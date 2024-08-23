"use client";

import { useState, useCallback } from "react";
import { useAuth, useSocket } from "@/context";
import { useRouter } from "next/navigation";
import { useToast } from "../ui/use-toast";
import { ToastAction } from "../ui/toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { User } from "firebase/auth";
import { UsersIcon, ArrowRightIcon, ChevronDownIcon } from "lucide-react";
import { Events } from "../constants";

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

  const showError = (error: string, desc?: string) => {
    toast({
      variant: "destructive",
      title: error,
      description: desc,
      action: <ToastAction altText="Try again">Try again</ToastAction>,
    });
  };

  const handleJoinGroup = useCallback(() => {
    if (joiningToken === "") {
      showError("Invalid Token", "Please enter a valid token");
      return;
    }
    setJoinLoad(false);
    const id = setTimeout(() => {
      socket?.emit(
        Events.GROUP.JOIN,
        joiningToken,
        user,
        async (response: Response) => {
          if (response.success) {
            await Join(joiningToken, user as User, response.token);
            router.push(`/group?id=${joiningToken}`);
          } else {
            showError(response.error);
            setJoinLoad(true);
          }
        }
      );
    }, 1000);

    return () => clearTimeout(id);
  }, [socket, router, joiningToken, user, Join]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="bg-gradient-to-r from-gray-100 to-gray-300 dark:from-gray-700 dark:to-gray-900 text-gray-800 dark:text-white hover:from-gray-200 hover:to-gray-400 dark:hover:from-gray-600 dark:hover:to-gray-800 flex items-center justify-center px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 focus:ring-opacity-50 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-gray-300 dark:hover:border-gray-600">
        <span>Join Other</span>
        <ChevronDownIcon className="ml-2 h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
            Join a Coding Group
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Enter the group code to join your friends
          </p>
          <div className="space-y-4">
            <div className="relative">
              <Input
                placeholder="Enter group code"
                value={joiningToken}
                onChange={(e) => setJoiningToken(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === "Enter" && handleJoinGroup()}
              />
              <UsersIcon
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={joinLoad ? "join" : "joining"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  onClick={handleJoinGroup}
                  disabled={!joinLoad || !joiningToken}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ease-in-out transform hover:scale-102 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {joinLoad ? (
                    <>
                      Join Group
                      <ArrowRightIcon className="ml-2" size={18} />
                    </>
                  ) : (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Joining...
                    </div>
                  )}
                </Button>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
