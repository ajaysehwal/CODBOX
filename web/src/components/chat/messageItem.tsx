import Image from "next/image";
import { Message } from "./chat";
import { User } from "lucide-react";
export const MessageItem = ({
  message,
  isCurrentUser,
}: {
  message: Message;
  isCurrentUser: boolean;
}) => {
  const senderIdentifier = message.name || message.email || "Unknown User";

  return (
    <li
      className={`flex ${
        isCurrentUser ? "justify-end" : "justify-start"
      } items-end animate-fade-in mb-4`}
    >
      {!isCurrentUser && (
        <div className="flex-shrink-0 mr-3">
          {message.avatar ? (
            <Image
              src={message.avatar}
              alt={senderIdentifier}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
              <User size={24} className="text-gray-500" />
            </div>
          )}
        </div>
      )}
      <div
        className={`flex flex-col max-w-[70%] ${
          isCurrentUser ? "items-end" : "items-start"
        }`}
      >
        {!isCurrentUser && (
          <span className="text-xs text-gray-500 mb-1 ml-2">
            {senderIdentifier}
          </span>
        )}
        <div
          className={`p-3 rounded-lg shadow-md ${
            isCurrentUser
              ? "bg-blue-600 text-white rounded-br-none"
              : "bg-white text-black rounded-bl-none"
          }`}
        >
          <p className="text-sm">{message.text}</p>
        </div>
      </div>
    </li>
  );
};
