"use client";
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { LANGUAGES, THEMES } from "../constants";
import { Language, Theme } from "../interface";
import GroupParticipants from "../chat/participants";
import { useSearchParams } from "next/navigation";
import { Input } from "../ui/input";
import { SelectSeparator } from "@radix-ui/react-select";

interface EditorHeaderProps {
  theme: Theme;
  language: Language;
  onThemeChange: (value: Theme) => void;
  onLanguageChange: (value: Language) => void;
  onEvalCode: () => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  theme,
  language,
  onThemeChange,
  onLanguageChange,
  onEvalCode,
}) => {
  const searchParams = useSearchParams();
  const groupId = searchParams.get("id") as string;

  return (
    <div className="h-[5vh] bg-[rgb(248,116,114)] w-full flex items-center">
      <Files />
      <Themes onThemeChange={onThemeChange} theme={theme} />
      <Languages onLanguageChange={onLanguageChange} language={language} />
      <RunCode run={onEvalCode} />
      {groupId && <GroupParticipants />}
    </div>
  );
};

const Themes = ({
  onThemeChange,
  theme,
}: {
  onThemeChange: (value: Theme) => void;
  theme: Theme;
}) => {
  return (
    <Select onValueChange={onThemeChange} value={theme}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Theme" />
      </SelectTrigger>
      <SelectContent>
        {THEMES.map((el) => (
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
  onLanguageChange: (value: Language) => void;
  language: Language;
}) => {
  return (
    <Select onValueChange={onLanguageChange} value={language}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent>
        {LANGUAGES.map((el) => (
          <SelectItem key={el} value={el}>
            {el.charAt(0).toUpperCase() + el.slice(1)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const RunCode = ({ run }: { run: () => void }) => (
  <div>
    <Button
      onClick={() => run()}
      className="bg-green-600 text-white flex items-center gap-1 hover:bg-green-500"
    >
      <Play className="w-[18px] h-[18px]" />
      Run
    </Button>
  </div>
);

const Files = () => {
  return (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="w-[400px]">
        <div className="flex items-center gap-2 justify-center">
          <Input placeholder="create new file" />
          <Button>Create</Button>
        </div>
        <SelectItem value="index.js">index.js</SelectItem>
        <SelectItem value="work.js">work.js</SelectItem>
      </SelectContent>
    </Select>
  );
};
