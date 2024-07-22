import { Send, Smile } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import EmojiPicker from "emoji-picker-react";
import { useEffect, useRef, useState } from "react";

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
}: MessageInputProps) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);

  const handleEmojiClick = (emojiObject: any) => {
    setText(text + emojiObject.emoji);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node) &&
        !emojiButtonRef.current?.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full absolute bottom-0 flex items-center justify-center">
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        className="h-16 px-5"
        placeholder="Enter message here..."
      />
      <Button
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        type="button"
        size="icon"
        className="size-[40px] absolute right-12 text-gray-500 bg-white hover:bg-gray-100"
      >
        <Smile className="h-6 w-6" />
      </Button>
      <Button
        disabled={isDisabled || !text.trim()}
        onClick={sendMessage}
        type="submit"
        size="icon"
        className="size-[40px] absolute right-1 bg-blue-700 text-white"
      >
        <Send />
      </Button>
      {showEmojiPicker && (
        <div ref={emojiPickerRef} className="absolute bottom-full right-0 mb-2">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}
    </div>
  );
};
