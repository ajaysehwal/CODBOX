"use client";

import React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Account, JoinGroup, CreateGroup, LeaveGroup, Invite } from ".";
import { useAuth, useSocket } from "@/context";
import { User } from "firebase/auth";
import { useToast } from "../ui/use-toast";
import { ToastAction } from "../ui/toast";
import GoogleSignIn from "./signIn";
import { MessageCircleMore } from "lucide-react";
import ChatSection from "../chat/chat";
import { Button } from "../ui/button";

export default function Navbar() {
  const path = usePathname().trim();
  const socket = useSocket();
  const searchParams = useSearchParams();
  const groupId = searchParams.get("id") as string;
  const { user } = useAuth();
  const { toast } = useToast();

  const handleJoin = async (
    groupId: string,
    user: User,
    audioToken: string
  ) => {
    if (groupId && user) {
      try {
        toast({
          variant: "default",
          title: "Joining..",
        });
        // Add your join logic here
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error joining group",
          description: "Unable to join group. Please try again.",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      }
    }
  };

  return (
    <motion.header
      className="z-50 bg-white dark:bg-gray-800 shadow-md"
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
        <motion.h1
          className="text-3xl font-black tracking-tight text-gray-900 dark:text-white"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          Code<span className="text-blue-500">XF</span>
        </motion.h1>

        <div className="flex items-center space-x-4">
          {!user ? (
            <GoogleSignIn />
          ) : (
            <>
              {path !== "/group" && <JoinGroup Join={handleJoin} />}
              {path === "/group" ? (
                <div className="flex items-center space-x-2">
                  <Invite />
                  <LeaveGroup />
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full p-2 border-2 border-blue-200 bg-white hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 ease-in-out shadow-sm hover:shadow-md focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
                    >
                      <MessageCircleMore className="w-6 h-6 text-blue-500 hover:text-blue-600 transition-colors duration-300 dark:text-blue-400 dark:hover:text-blue-300" />
                    </Button>
                  </motion.div>
                </div>
              ) : (
                <CreateGroup Join={handleJoin} />
              )}
              <Account />
            </>
          )}
        </div>
      </nav>

      {path === "/group" && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="lg:hidden"
        >
          <ChatSection />
        </motion.div>
      )}
    </motion.header>
  );
}
