"use client";

import React, { useState, useEffect, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useAuth, useSocket } from "@/context";
import { generateRandomToken } from "@/utils";

type Message = {
  id: string;
  name: string;
  text: string;
  uuid: string;
  timestamp: Date;
  email: string;
};

export default function ChatSection() {
  const socket = useSocket();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const groupId = searchParams.get("id") as string;

  const [text, setText] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);

  const sendMessage = useCallback(() => {
    if (!user || !groupId) return;

    const message: Message = {
      id: generateRandomToken(18),
      text,
      uuid: user.uid,
      name: user.displayName || "",
      email: user.email || "",
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

    socket.emit("getMessages", groupId, (fetchedMessages: Message[]) => {
      setMessages(fetchedMessages);
    });

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage");
      socket.off("AllGroupMessage");
    };
  }, [socket, groupId, handleReceiveMessage]);

  return (
    <div className="min-h-full bg-gradient-to-r from-indigo-200 to-yellow-100 relative">
      <MessageList messages={messages} currentUserId={user?.uid} />
      <MessageInput
        text={text}
        setText={setText}
        sendMessage={sendMessage}
        isDisabled={pathname !== "/group" || !groupId}
      />
    </div>
  );
}

type MessageListProps = {
  messages: Message[];
  currentUserId?: string;
};

const MessageList = ({ messages, currentUserId }: MessageListProps) => (
  <ul className="h-[560px] space-y-5 overflow-scroll overflow-x-auto overflow-y-auto p-3">
    {messages.map((message) => (
      <React.Fragment key={message.id}>
        {message.uuid === currentUserId ? (
          <MyMessage message={message.text} />
        ) : (
          <OtherMessage message={message.text} />
        )}
      </React.Fragment>
    ))}
  </ul>
);

type MessageInputProps = {
  text: string;
  setText: (text: string) => void;
  sendMessage: () => void;
  isDisabled: boolean;
};

const MessageInput = ({ text, setText, sendMessage, isDisabled }: MessageInputProps) => (
  <div className="w-full absolute bottom-0 flex items-center justify-center">
    <Input
      value={text}
      onChange={(e) => setText(e.target.value)}
      className="h-16 px-5"
      placeholder="Enter message here.."
    />
    <Button
      disabled={isDisabled}
      onClick={sendMessage}
      type="submit"
      className="h-14 absolute right-1 bg-blue-700 text-white rounded-full"
    >
      Send
    </Button>
  </div>
);

const OtherMessage = ({ message }: { message: string }) => (
  <li className="max-w-lg flex gap-x-2 sm:gap-x-4">
    <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3 dark:bg-neutral-900 dark:border-neutral-700">
      <p className="text-sm text-black">{message}</p>
    </div>
  </li>
);

const MyMessage = ({ message }: { message: string }) => (
  <li className="max-w-lg ms-auto flex justify-end gap-x-2 sm:gap-x-4">
    <div className="grow text-end space-y-3">
      <div className="inline-block bg-blue-600 rounded-2xl p-4 shadow-sm">
        <p className="text-sm text-white">{message}</p>
      </div>
    </div>
  </li>
);