import React, { useState, useEffect } from "react";
import { MessageCircle, Bell, User, Settings } from "lucide-react";
import { useToggleStore } from "@/zustand";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import ChatSection from "../chat/chat";
import { Skeleton } from "@/components/ui/skeleton";
import NotificationDialog from "./NotificationDialog";
import ProfileDialog from "./ProfileDialog";
import SettingsDialog from "./SettingDialog";

interface SidebarIconProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  badge?: number;
  isLoading?: boolean;
}

const sidebarVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { staggerChildren: 0.1 } },
};

const iconVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
};

const chatBoxVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, scale: 0.6, y: 20, transition: { duration: 0.2 } },
};

const SidebarIcon: React.FC<SidebarIconProps> = ({
  icon,
  label,
  onClick,
  badge,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <>
        <Skeleton className="w-12 h-12 rounded-full" />
      </>
    );
  }

  return (
    <motion.div
      className="sidebar-icon group relative w-12 h-12 flex items-center justify-center"
      variants={iconVariants}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <span className="sidebar-tooltip group-hover:scale-100">{label}</span>
      {icon}
      {badge && (
        <motion.div
          className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          {badge > 99 ? "99+" : badge}
        </motion.div>
      )}
    </motion.div>
  );
};
const ChatBox: React.FC = () => (
  <motion.div
    variants={chatBoxVariants}
    initial="hidden"
    animate="visible"
    exit="exit"
    className="fixed right-28 h-[560px] w-[500px] top-10 z-[60] rounded-lg shadow-lg overflow-hidden"
  >
    <ChatSection />
  </motion.div>
);

export default function Right() {
  const { isChatOpen, setChatOpen } = useToggleStore();
  const searchParams = useSearchParams();
  const groupId = searchParams.get("id") as string;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleIconClick = (action: string) => {
    if (action === "Chat") setChatOpen(!isChatOpen);
  };

  return (
    <>
      <motion.div
        className="fixed left-0 top-0 h-[90vh] flex flex-col items-center justify-center space-y-8 bg-[rgb(217,232,254)] text-gray-800 z-50 p-4 rounded-r-2xl"
        variants={sidebarVariants}
        initial="visible"
        animate="visible"
      >
        {groupId && (
          <SidebarIcon
            icon={<MessageCircle size={24} />}
            label="Chat"
            onClick={() => handleIconClick("Chat")}
            isLoading={isLoading}
          />
        )}
        <Dialog>
          <DialogTrigger asChild>
            <SidebarIcon
              icon={<Bell size={24} />}
              label="Notifications"
              onClick={() => {}}
              badge={10}
              isLoading={isLoading}
            />
          </DialogTrigger>
          <NotificationDialog />
        </Dialog>
        <Dialog>
          <DialogTrigger asChild>
            <SidebarIcon
              icon={<User size={24} />}
              label="Profile"
              onClick={() => {}}
              isLoading={isLoading}
            />
          </DialogTrigger>
          <ProfileDialog />
        </Dialog>
        <Dialog>
          <DialogTrigger asChild>
            <SidebarIcon
              icon={<Settings size={24} />}
              label="Settings"
              onClick={() => {}}
              isLoading={isLoading}
            />
          </DialogTrigger>
          <SettingsDialog />
        </Dialog>
      </motion.div>
      <AnimatePresence>{isChatOpen && <ChatBox />}</AnimatePresence>
    </>
  );
}
