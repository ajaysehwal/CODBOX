"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { useAuth, useSocket } from "@/context";
import { generateRandomToken } from "@/utils";
import { MessageList } from "./messageList";
import { MessageInput } from "./messageInput";
import { Events } from "../constants";
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
  const { socket } = useSocket();
  const { user } = useAuth();
  const pathname = usePathname();
  const { id: groupId } = useParams<{ id: string }>();
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

    socket?.emit(Events.CHAT.SEND, groupId, message);
    setText("");
  }, [socket, user, groupId, text]);

  const handleReceiveMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  useEffect(() => {
    if (!socket || !groupId) return;

    const loadMessages = () => {
      socket.emit(
        Events.CHAT.GET_MESSAGES,
        groupId,
        (fetchedMessages: Message[]) => {
          setMessages(fetchedMessages);
          setIsLoading(false);
          scrollToBottom();
        }
      );
    };

    loadMessages();
    socket.on(Events.CHAT.RECEIVE, handleReceiveMessage);

    return () => {
      socket.off(Events.CHAT.RECEIVE);
      socket.off(Events.CHAT.GET_MESSAGES);
    };
  }, [socket, groupId, handleReceiveMessage, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  return (
    <div className="min-h-full bg-gradient-to-r from-blue-300 to-blue-500 relative rounded-lg">
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
