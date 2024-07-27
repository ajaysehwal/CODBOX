import { useState } from "react";
import {
  Heart,
  MessageSquare,
  UserPlus,
  Check,
  X,
  Settings,
  Bell,
  Trash2,
} from "lucide-react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

export const NotificationDialog = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "message",
      content: "New message from John Doe",
      time: "5 minutes ago",
      read: false,
    },
    {
      id: 2,
      type: "like",
      content: "Sarah liked your post",
      time: "1 hour ago",
      read: false,
    },
    {
      id: 3,
      type: "comment",
      content: "New comment on your photo",
      time: "2 hours ago",
      read: true,
    },
    {
      id: 4,
      type: "follow",
      content: "Alex started following you",
      time: "1 day ago",
      read: true,
    },
  ]);
  const [isClearing, setIsClearing] = useState(false);

  const markAllAsRead = () => {
    setIsClearing(true);
    setTimeout(() => {
      setNotifications(
        notifications.map((notif) => ({ ...notif, read: true }))
      );
      setIsClearing(false);
      setNotifications([]);
    }, notifications.length * 100 + 300);
  };

  return (
    <DialogContent className="sm:max-w-[400px] bg-white rounded-lg shadow-2xl">
      <DialogHeader className="flex flex-row items-center justify-between">
        <DialogTitle className="text-2xl font-bold text-gray-800">
          Notifications
        </DialogTitle>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-gray-700"
          >
            <Settings size={20} />
          </Button>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </Button>
          </DialogTrigger>
        </div>
      </DialogHeader>
      <ScrollArea className="h-[300px] pr-4 overflow-hidden">
        <AnimatePresence>
          {notifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ x: 0 }}
              animate={{ x: isClearing ? "100%" : 0 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
                delay: isClearing ? index * 0.1 : 0, // Stagger the animations
              }}
            >
              <NotificationItem notification={notification} />
            </motion.div>
          ))}
        </AnimatePresence>
      </ScrollArea>
      <div className="mt-4 flex justify-between items-center">
        <Button variant="outline" className="text-sm" onClick={markAllAsRead}>
          Mark all as read
        </Button>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white text-sm">
          See all notifications
        </Button>
      </div>
    </DialogContent>
  );
};

const NotificationItem = ({ notification }: any) => {
  const getIcon = (type: string) => {
    switch (type) {
      case "message":
        return <Bell size={16} className="text-blue-500" />;
      case "like":
        return <Heart size={16} className="text-red-500" />;
      case "comment":
        return <MessageSquare size={16} className="text-green-500" />;
      case "follow":
        return <UserPlus size={16} className="text-purple-500" />;
      default:
        return <Bell size={16} className="text-gray-500" />;
    }
  };

  return (
    <div
      className={`flex items-start space-x-4 p-3 rounded-lg transition-colors duration-200 ${
        notification.read ? "bg-gray-50" : "bg-blue-50"
      }`}
    >
      <div className="flex-shrink-0">{getIcon(notification.type)}</div>
      <div className="flex-grow">
        <p
          className={`text-sm ${
            notification.read ? "text-gray-600" : "text-gray-800 font-medium"
          }`}
        >
          {notification.content}
        </p>
        <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
      </div>
      <div className="flex-shrink-0 flex space-x-2">
        {!notification.read && (
          <Button
            variant="ghost"
            size="icon"
            className="text-blue-500 hover:text-blue-600"
          >
            <Check size={16} />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="text-red-500 hover:text-red-600"
        >
          <Trash2 size={16} />
        </Button>
      </div>
    </div>
  );
};
