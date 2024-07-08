import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CopyText } from "@/utils";
import { useRef } from "react";
import { CopyButton } from "../ui/iconsbuttons";
import { useSearchParams } from "next/navigation";

export const Invite = () => {
  const textRef = useRef<HTMLTextAreaElement | null>(null);
  const searchParams = useSearchParams();
  const groupId = searchParams.get("id") as string;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-xl border border-transparent bg-lime-400 text-black hover:bg-lime-500 transition disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:bg-lime-500">
        Invite Friends
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-3">
        <div className="flex items-center justify-center gap-2 bg-gray-100 p-2">
          <p
            className="bg-gray-200 p-3 rounded-xl "
            ref={textRef as React.RefObject<HTMLDivElement>}
          >
            {groupId}
          </p>
          <CopyButton onClick={() => CopyText(textRef)} />
        </div>
        <p className="text-xs text-gray-500">
          Share your code with your friends
        </p>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
