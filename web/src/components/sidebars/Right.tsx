import React from "react";
import { MessageCircle, Bell, User, Settings } from "lucide-react";
import { useBoxStore } from "@/zustand";
import { motion, AnimatePresence } from "framer-motion";
import ChatSection from "../chat/chat";
import { useSearchParams } from "next/navigation";

export default function Right() {
  const { isBoxOpen, setBoxOpen } = useBoxStore();
  const searchParams = useSearchParams();
  const groupId = searchParams.get("id") as string;

  const handleIconClick = (action: string) => {
    switch (action) {
      case "Chat":
        setBoxOpen(!isBoxOpen);
        break;
      case "Notifications":
        console.log("Notifications clicked");
        break;
      case "Profile":
        console.log("Profile clicked");
        break;
      case "Settings":
        console.log("Settings clicked");
        break;
      default:
        break;
    }
  };

  return (
    <>
      <div className="fixed left-0 top-0 h-full w-full flex flex-col items-start justify-center space-y-8 bg-[rgb(217,232,254)] text-white shadow-lg z-50">
        {groupId && (
          <SidebarIcon
            icon={<MessageCircle size={24} />}
            label="Chat"
            onClick={() => handleIconClick("Chat")}
          />
        )}

        <SidebarIcon
          icon={<Bell size={24} />}
          label="Notifications"
          onClick={() => handleIconClick("Notifications")}
        />
        <SidebarIcon
          icon={<User size={24} />}
          label="Profile"
          onClick={() => handleIconClick("Profile")}
        />
        <SidebarIcon
          icon={<Settings size={24} />}
          label="Settings"
          onClick={() => handleIconClick("Settings")}
        />
      </div>
      <AnimatePresence>{isBoxOpen && <ChatBox />}</AnimatePresence>
    </>
  );
}

interface SidebarIconProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const SidebarIcon: React.FC<SidebarIconProps> = ({ icon, label, onClick }) => {
  return (
    <div className="sidebar-icon group" onClick={onClick}>
      <span className="sidebar-tooltip group-hover:scale-100">{label}</span>
      {icon}
    </div>
  );
};

const ChatBox = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.6, y: 20 }}
      transition={{ duration: 0.2 }}
      className="fixed right-28 h-[560px] w-[500px] top-10 z-[60] rounded-lg shadow-lg"
    >
      <ChatSection />
    </motion.div>
  );
};