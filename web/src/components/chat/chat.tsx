"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth, useSocket } from "@/context";
import { generateRandomToken } from "@/utils";
import { MessageList } from "./messageList";
import { MessageInput } from "./messageInput";
export type Message = {
  id: string;
  name: string;
  text: string;
  uuid: string;
  avatar: string;
  timestamp: Date;
  email: string;
};
export default function ChatSection() {
  const socket = useSocket();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const groupId = searchParams.get("id") as string;
  const [isLoading, setIsLoading] = useState(true);
  const [text, setText] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLLIElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const sendMessage = useCallback(() => {
    if (!user || !groupId || !text.trim()) return;

    const message: Message = {
      id: generateRandomToken(18),
      text: text.trim(),
      uuid: user.uid,
      name: user.displayName || "",
      email: user.email || "",
      avatar: user.photoURL || "",
      timestamp: new Date(),
    };

    socket?.emit("sendMessage", groupId, message);
    setText("");
  }, [socket, user, groupId, text]);

  const handleReceiveMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  useEffect(() => {
    if (!socket || !groupId) return;

    const loadMessages = () => {
      socket.emit("getMessages", groupId, (fetchedMessages: Message[]) => {
        setMessages(fetchedMessages);
        setIsLoading(false);
        scrollToBottom();
      });
    };

    loadMessages();
    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage");
      socket.off("AllGroupMessage");
    };
  }, [socket, groupId, handleReceiveMessage, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  return (
    <div className="min-h-full bg-gradient-to-r from-blue-100 to-blue-400 relative">
      <MessageList
        messages={messages}
        currentUserId={user?.uid}
        isLoading={isLoading}
        messagesEndRef={messagesEndRef}
      />
      <MessageInput
        text={text}
        setText={setText}
        sendMessage={sendMessage}
        isDisabled={pathname !== "/group" || !groupId}
      />
    </div>
  );
}
