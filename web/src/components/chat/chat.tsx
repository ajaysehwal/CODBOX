import React, { useEffect } from "react";
import { Input } from "../ui/input";
import { useAuth, useSocket } from "@/context";
import { Button } from "../ui/button";
import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
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
  const [text, setText] = useState<string>("");
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const groupId = searchParams.get("id") as string;
  const [messages, setMessages] = useState<Message[]>([]);

  const sendMessage = (groupId: string) => {
    const message = {
      id: generateRandomToken(18),
      text: text,
      uuid: user?.uid,
      name: user?.displayName,
      email: user?.email,
      timeStamp: new Date(),
    };
    socket?.emit("sendMessage", groupId, message);
    setText("");
  };
  useEffect(() => {
    if (socket) {
      socket.emit("getMessages", groupId, (messages: Message[]) => {
        setMessages(messages);
      });
      socket.on("receiveMessage", (message: Message) => {
        setMessages((prev) => {
          const prevMessage = Array.isArray(prev) ? prev : [];
          return [...prevMessage, message];
        });
      });
    }
    return () => {
      socket?.off("receiveMessage");
      socket?.off("AllGroupMessage");
    };
  }, [socket]);
  return (
    <div className="min-h-full bg-gradient-to-r from-indigo-200 to-yellow-100">
      <ul className="h-[560px] space-y-5 overflow-scroll overflow-x-auto overflow-y-auto p-3">
        {messages.map((message) => (
          <>
            {message.uuid === user?.uid ? (
              <MyMessage message={message.text} />
            ) : (
              <OtherMessage message={message.text} />
            )}
          </>
        ))}
      </ul>
      <div className="w-full absolute bottom-0 flex items-center justify-center">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="h-16 px-5"
          placeholder="Enter message here.."
        />
        <Button
          disabled={pathname !== "/group" && groupId === null}
          onClick={() => sendMessage(groupId)}
          type="submit"
          className="h-14 absolute right-1 bg-blue-700 text-white rounded-full"
        >
          Send
        </Button>
      </div>
    </div>
  );
}

const OtherMessage = ({ message }: { message: string }) => {
  return (
    <li className="max-w-lg flex gap-x-2 sm:gap-x-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3 dark:bg-neutral-900 dark:border-neutral-700">
        <p className="text-sm text-black">{message}</p>
      </div>
    </li>
  );
};

const MyMessage = ({ message }: { message: string }) => {
  return (
    <li className="max-w-lg ms-auto flex justify-end gap-x-2 sm:gap-x-4">
      <div className="grow text-end space-y-3">
        <div className="inline-block bg-blue-600 rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-white">{message}</p>
        </div>
      </div>
    </li>
  );
};
