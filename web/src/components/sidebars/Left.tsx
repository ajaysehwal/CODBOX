import React, { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDrawerStore, useUserFileStore } from "@/zustand";
import {
  ArrowDownToLine,
  FileText,
  Plus,
  Trash2,
  File,
  Code,
  Image,
  Video,
  Music,
  FileSearch,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCodeFile } from "@/hooks";
import Link from "next/link";

type FileIconMap = {
  [key: string]: React.ComponentType<{ className?: string }>;
};

const fileIcons: FileIconMap = {
  js: Code,
  ts: Code,
  jsx: Code,
  tsx: Code,
  html: Code,
  css: Code,
  json: Code,
  md: FileText,
  txt: FileText,
  png: Image,
  jpg: Image,
  jpeg: Image,
  gif: Image,
  mp4: Video,
  avi: Video,
  mov: Video,
  mp3: Music,
  wav: Music,
};

const Left: React.FC = () => {
  const { drawerOpen, setDrawerOpen } = useDrawerStore();
  const { files, addNewFile, selectedFile } = useUserFileStore();
  const { createNewFile, getAllFiles, createLoad, getFileContent } =
    useCodeFile();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredFiles, setFilteredFiles] = useState<string[]>(files);
  const { setSelectedFile } = useUserFileStore();
  useEffect(() => {
    setFilteredFiles(
      files.filter((file) =>
        file.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, files]);

  const handleCreateFile = () => {
    if (searchTerm) {
      createNewFile(searchTerm);
      addNewFile(searchTerm);
      setSearchTerm("");
    }
  };

  const getFileIcon = (fileName: string): JSX.Element => {
    const extension = fileName.split(".").pop()?.toLowerCase() || "";
    const FileIcon = fileIcons[extension] || FileSearch;
    return <FileIcon className="h-5 w-5" />;
  };

  return (
    <Sheet open={drawerOpen}>
      <SheetContent
        className="w-[320px] lg:w-[350px] bg-white dark:bg-gray-900 rounded-r-3xl shadow-2xl border-l border-gray-100 dark:border-gray-800 transition-all duration-300 ease-in-out"
        side="left"
        onMouseEnter={() => setDrawerOpen(true)}
        onMouseLeave={() => setDrawerOpen(false)}
      >
        <SheetHeader className="pb-8">
          <SheetTitle className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">
            Code<span className="text-blue-500">XF</span>
          </SheetTitle>
          <SheetDescription className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Elevate your coding experience
          </SheetDescription>
        </SheetHeader>

        <div className="relative mb-8">
          <Input
            placeholder="Search or create files..."
            className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-full py-3 pl-5 pr-12 text-sm focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 transition-all duration-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button
            size="icon"
            variant="ghost"
            onClick={handleCreateFile}
            disabled={filteredFiles.length > 0}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400 transition-colors duration-200"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-220px)] pr-4">
          {filteredFiles.map((file, i) => (
            <div
              key={i}
              className={`group flex items-center justify-between py-3 px-4 mb-2 rounded-2xl transition-all duration-200 ease-in-out ${
                selectedFile === file
                  ? "bg-blue-50 dark:bg-blue-900/30"
                  : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
              }`}
            >
              <Link
                href={`?file=${file}`}
                onClick={() => {
                  setDrawerOpen(false);
                  setSelectedFile(file);
                  getFileContent(file);
                }}
                className="flex items-center space-x-3 flex-grow"
              >
                <div
                  className={`p-2 rounded-xl ${
                    selectedFile === file
                      ? "bg-blue-100 dark:bg-blue-800"
                      : "bg-gray-200 dark:bg-gray-700"
                  } transition-colors duration-200`}
                >
                  {getFileIcon(file)}
                </div>
                <span className="text-sm font-medium truncate text-gray-700 dark:text-gray-300">
                  {file}
                </span>
              </Link>

              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-full"
                >
                  <ArrowDownToLine className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 rounded-full"
                  // onClick={() => removeFile(file)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default Left;
