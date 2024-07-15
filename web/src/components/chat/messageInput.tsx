import { Send } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

type MessageInputProps = {
    text: string;
    setText: (text: string) => void;
    sendMessage: () => void;
    isDisabled: boolean;
  };
  
 export const MessageInput = ({
    text,
    setText,
    sendMessage,
    isDisabled,
  }: MessageInputProps) => (
    <div className="w-full absolute bottom-0 flex items-center justify-center">
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        className="h-16 px-5"
        placeholder="Enter message here..."
      />
      <Button
        disabled={isDisabled || !text.trim()}
        onClick={sendMessage}
        type="submit"
        size="icon"
        className="size-[40px] absolute right-1 bg-blue-700 text-white"
      >
        <Send />
      </Button>
    </div>
  );
  