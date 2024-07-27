"use client";

import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Code, FileCode, Play, X, Settings } from "lucide-react";
import { DEFAULT_LANGUAGE, DEFAULT_THEME } from "../constants";
import { Language, Theme } from "../interface";
import GroupParticipants from "../chat/participants";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/context";
import GoogleSignIn from "../navbar/signIn";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useEditorToggle, useUserFileStore } from "@/zustand";

interface EditorHeaderProps {
  theme: Theme;
  language: Language;
  onThemeChange: React.Dispatch<React.SetStateAction<Theme>>;
  onLanguageChange: React.Dispatch<React.SetStateAction<Language>>;
  onEvalCode: () => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  theme,
  language,
  onThemeChange,
  onLanguageChange,
  onEvalCode,
}) => {
  const { isEditorOpen, setEditorOpen } = useEditorToggle();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { selectedFile, setSelectedFile } = useUserFileStore();
  const file = searchParams.get("file") as string;

  useEffect(() => {
    if (file) {
      setSelectedFile(file);
    }
  }, [file, setSelectedFile]);

  return (
    <div className="h-16 bg-[rgb(217,232,254)] w-full flex items-center justify-between px-4 shadow-sm">
      <div className="flex items-center space-x-2 w-full">
        <Button className="bg-white text-gray-700 hover:bg-gray-50 transition-colors duration-200 shadow-sm flex items-center space-x-2 rounded-md border border-gray-200">
          <FileCode className="w-4 h-4 text-indigo-500" />
          <span className="truncate max-w-[120px] font-medium">
            {selectedFile}
          </span>
        </Button>
        <Themes onThemeChange={onThemeChange} theme={theme} />
        <Languages onLanguageChange={onLanguageChange} language={language} />
        <Button
          onClick={() => setEditorOpen(!isEditorOpen)}
          className="bg-white text-gray-700 hover:bg-gray-50 transition-colors duration-200 shadow-sm flex items-center space-x-2 rounded-md border border-gray-200"
        >
          <Code className="w-4 h-4 text-indigo-500" />
          <span>{isEditorOpen ? "CodeEditor" : "Whiteboard"}</span>
        </Button>
        <RunCode run={onEvalCode} />
      </div>
      {pathname === "/group" && <GroupParticipants />}
    </div>
  );
};

const Themes = ({
  onThemeChange,
  theme,
}: {
  onThemeChange: React.Dispatch<React.SetStateAction<Theme>>;
  theme: Theme;
}) => {
  return (
    <Select
      onValueChange={(value: Theme) => onThemeChange(value)}
      value={theme}
    >
      <SelectTrigger className="w-[140px] bg-white text-gray-700 border border-gray-200 shadow-sm rounded-md">
        <SelectValue placeholder="Theme" />
      </SelectTrigger>
      <SelectContent className="bg-white rounded-md shadow-lg border border-gray-200">
        {DEFAULT_THEME.map((el) => (
          <SelectItem
            key={el}
            value={el}
            className="hover:bg-gray-50 text-gray-700"
          >
            {el.charAt(0).toUpperCase() + el.slice(1)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const Languages = ({
  onLanguageChange,
  language,
}: {
  onLanguageChange: React.Dispatch<React.SetStateAction<Language>>;
  language: Language;
}) => {
  return (
    <Select
      onValueChange={(value: Language) => onLanguageChange(value)}
      value={language}
    >
      <SelectTrigger className="w-[140px] bg-white text-gray-700 border border-gray-200 shadow-sm rounded-md">
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent className="bg-white rounded-md shadow-lg border border-gray-200">
        {DEFAULT_LANGUAGE.map((el) => (
          <SelectItem
            key={el}
            value={el}
            className="hover:bg-gray-50 text-gray-700"
          >
            {el.charAt(0).toUpperCase() + el.slice(1)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const RunCode = ({ run }: { run: () => void }) => {
  const { isAuth } = useAuth();
  const [open, setOpen] = useState<boolean>(false);

  const compileCode = () => {
    if (isAuth) {
      setOpen(false);
      run();
    } else {
      setOpen(true);
    }
  };

  useEffect(() => {
    isAuth && setOpen(false);
  }, [isAuth]);

  return (
    <>
      <Dialog open={open}>
        <DialogContent className="p-6 max-w-sm mx-auto bg-white rounded-lg shadow-xl border border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800">
              Sign in to access all features
            </DialogTitle>
          </DialogHeader>
          <GoogleSignIn />
          <DialogPrimitive.Close
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogContent>
      </Dialog>

      <Button
        onClick={compileCode}
        className="bg-indigo-500 text-white hover:bg-indigo-600 transition-colors duration-200 shadow-sm flex items-center space-x-2 rounded-md"
      >
        <Play className="w-4 h-4" />
        <span>Run</span>
      </Button>
    </>
  );
};
