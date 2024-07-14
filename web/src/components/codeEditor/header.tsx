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
    <div className="h-[5vh] bg-[rgb(199,209,248)] w-full flex items-center">
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
