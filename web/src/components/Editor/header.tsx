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
import { Play, X } from "lucide-react";
import { DEFAULT_LANGUAGE, DEFAULT_THEME } from "../constants";
import { Language, Theme } from "../interface";
import GroupParticipants from "../chat/participants";
import { useSearchParams } from "next/navigation";
import { Input } from "../ui/input";
import { useAuth } from "@/context";
import GoogleSignIn from "../navbar/signIn";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useEditorToggle, useUserFileStore } from "@/zustand";
import { POST, GET } from "@/lib/api";
import { useCodeFile } from "@/hooks";
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
  const groupId = searchParams.get("id") as string;
  return (
    <div className="h-[5vh] bg-[rgb(217,232,254)] w-full flex items-center">
      <Files />
      <Themes onThemeChange={onThemeChange} theme={theme} />
      <Languages onLanguageChange={onLanguageChange} language={language} />
      <Button
        onClick={() => setEditorOpen(!isEditorOpen)}
        className="w-[180px] bg-white text-black hover:bg-gray-200"
      >
        {isEditorOpen ? "CodeEditor" : "Whiteboard"}
      </Button>
      <RunCode run={onEvalCode} />
      {groupId && <GroupParticipants />}
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
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Theme" />
      </SelectTrigger>
      <SelectContent>
        {DEFAULT_THEME.map((el) => (
          <SelectItem key={el} value={el}>
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
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent>
        {DEFAULT_LANGUAGE.map((el) => (
          <SelectItem key={el} value={el}>
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
    <div>
      <Dialog open={open}>
        <DialogContent className="p-4 h-[150px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Please Signin for access all features
            </DialogTitle>
          </DialogHeader>
          <GoogleSignIn />
          <DialogPrimitive.Close
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogContent>
      </Dialog>

      <Button
        onClick={() => compileCode()}
        className="bg-green-600 text-white flex items-center gap-1 hover:bg-green-500"
      >
        <Play className="w-[18px] h-[18px]" />
        Run
      </Button>
    </div>
  );
};

const Files = () => {
  const { user } = useAuth();
  const { files } = useUserFileStore();
  const [filename, setFileName] = useState<string>("");
  const { createNewFile, getAllFiles } = useCodeFile();

  const createIndexFile = async () => {
    await POST(
      "/file/create/index",
      {
        userId: user?.uid,
        filename: "index.js",
        content: "// starting writing code here..",
      },
      { withCredentials: true }
    );
    localStorage.setItem("__FILE_FLAG", "true");
  };
  useEffect(() => {
    const isIndexFileCreated = localStorage.getItem("__FILE_FLAG") === "true";
    if (!isIndexFileCreated) {
      createIndexFile();
    }
    if (user) {
      getAllFiles(user?.uid);
    }
  }, [user?.uid]);

  return (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="w-[400px]">
        <div className="flex items-center gap-2 justify-center">
          <Input
            placeholder="create new file"
            value={filename}
            onChange={(e) => setFileName(e.target.value)}
          />
          <Button onClick={() => createNewFile(filename)}>Create</Button>
        </div>
        {files.map((file) => (
          <SelectItem key={file} value={file}>
            {file}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
