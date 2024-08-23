"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CopyText } from "@/utils";
import { useRef } from "react";
import { CopyButton } from "../ui/iconsbuttons";
import { useSearchParams } from "next/navigation";
import { Button } from "../ui/button";
import { UserPlus, Share } from "lucide-react";

export const Invite = () => {
  const textRef = useRef<HTMLTextAreaElement | null>(null);
  const searchParams = useSearchParams();
  const groupId = searchParams.get("id") as string;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="py-2.5 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 text-white hover:from-blue-500 hover:to-indigo-600 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
        <UserPlus className="w-4 h-4" />
        <span>Invite Friends</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-4 bg-white rounded-md shadow-lg border border-gray-200 w-72">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between gap-2 bg-gray-50 p-3 rounded-md">
            <p
              className="bg-white text-gray-700 p-2 rounded-md border border-gray-200 flex-grow font-mono text-sm"
              ref={textRef as React.RefObject<HTMLDivElement>}
            >
              {groupId}
            </p>
            <CopyButton onClick={() => CopyText(textRef)} />
          </div>
          <p className="text-sm text-gray-600">
            Share this code with your friends to invite them to your group.
          </p>
          <Button className="w-full bg-indigo-500 text-white hover:bg-indigo-600 transition-colors duration-200 shadow-sm flex items-center justify-center space-x-2 rounded-md">
            <Share className="w-4 h-4" />
            <span>Share Invite Link</span>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
