"use client";

import React, { Suspense, lazy, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useToggleStore } from "@/zustand";
import {  Theme } from "../../interface";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { FileCode, Code, Search } from "lucide-react";
import { ThemeSelector } from "./ThemeSelector";
import { RunCodeButton } from "./Run";
import { getFileIcon } from "@/components/sidebars/Left";

const GroupParticipants = lazy(() => import("../../chat/participants"));

interface EditorHeaderProps {
  theme: Theme;
  onThemeChange: (value: Theme) => void;
  onEvalCode: () => void;
  filename: string;
}

const HeaderButton: React.FC<{
  onClick?: () => void;
  icon: React.ReactNode;
  text: string;
  shortcut?: string;
}> = ({ onClick, icon, text, shortcut }) => (
  <Button
    onClick={onClick}
    className="bg-white text-gray-700 hover:bg-gray-50 transition-colors duration-200 shadow-sm flex items-center space-x-2 rounded-md border border-gray-200 whitespace-nowrap"
  >
    {icon}
    <span>{text}</span>
    {shortcut && (
      <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
        {shortcut}
      </kbd>
    )}
  </Button>
);

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  theme,
  onThemeChange,
  onEvalCode,
  filename,
}) => {
  const { isEditorOpen, setEditorOpen, setIsOpenSearchBox, isOpenSearchBox } =
    useToggleStore();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpenSearchBox(!isOpenSearchBox);
      }
    };
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [isOpenSearchBox, setIsOpenSearchBox]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="h-16 bg-[rgb(217,232,254)] w-full flex items-center justify-between px-4 shadow-sm">
      <ScrollArea className="w-full">
        <div className="flex items-center space-x-2 py-4">
          <HeaderButton icon={getFileIcon(filename)} text={filename} />
          <ThemeSelector onThemeChange={onThemeChange} theme={theme} />
          <HeaderButton
            onClick={() => setEditorOpen(!isEditorOpen)}
            icon={<Code className="w-4 h-4 text-indigo-500" />}
            text={isEditorOpen ? "CodeEditor" : "Whiteboard"}
          />
          <RunCodeButton run={onEvalCode} />
          <HeaderButton
            onClick={() => setIsOpenSearchBox(true)}
            icon={<Search className="w-4 h-4 text-indigo-500" />}
            text="Search"
            shortcut="⌘K"
          />
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      {pathname === "/group" && (
        <Suspense fallback={<Skeleton className="h-10 w-40" />}>
          <GroupParticipants />
        </Suspense>
      )}
    </div>
  );
};

const LoadingSkeleton: React.FC = () => (
  <div className="h-16 bg-[rgb(217,232,254)] w-full flex items-center justify-between px-4 shadow-sm">
    <div className="flex items-center space-x-2 w-full">
      <Skeleton className="h-10 w-32" />
      <Skeleton className="h-10 w-[140px]" />
      <Skeleton className="h-10 w-[140px]" />
      <Skeleton className="h-10 w-32" />
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-10 w-24" />
    </div>
    <Skeleton className="h-10 w-40" />
  </div>
);

export default EditorHeader;
