import { Message } from "./chat";
import { MessageItem } from "./messageItem";
import { SkeletonChat } from "./skeletonChat";

type MessageListProps = {
    messages: Message[];
    currentUserId?: string;
    isLoading: boolean;
    messagesEndRef: React.RefObject<HTMLLIElement>;
  };
  
 export const MessageList = ({
    messages,
    currentUserId,
    isLoading,
    messagesEndRef,
  }: MessageListProps) => (
    <ul
      className="h-[560px] overflow-y-auto p-4 space-y-4 backdrop-blur-sm rounded-lg
                   scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-blue-100
                   hover:scrollbar-thumb-blue-700 transition-all duration-200"
    >
      {isLoading ? (
        <SkeletonChat />
      ) : (
        <>
          {messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              isCurrentUser={message.uuid === currentUserId}
            />
          ))}
          <li ref={messagesEndRef} />
        </>
      )}
    </ul>
  );