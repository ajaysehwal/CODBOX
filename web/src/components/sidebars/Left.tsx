import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToggleStore } from "@/zustand";
import { useUserFiles, useGroupFiles } from "@/hooks";
import { ArrowDownToLine, Plus, Trash2, FileSearch } from "lucide-react";
import { LANGUAGE_ICONS, LanguageIconType } from "@/components/constants";

type File = string;
type FileIconGetter = (fileName: string) => JSX.Element;

interface FileDrawerProps {}
interface FileSearchInputProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleCreateFile: () => void;
  isCreateDisabled: boolean;
}
interface FileListProps {
  files: File[];
  selectedFile: { filename: string; content: string } | null;
  selectFile: (file: File) => void;
  setIsDrawerOpen: (isOpen: boolean) => void;
  getFileIcon: FileIconGetter;
}
interface FileListItemProps {
  file: File;
  isSelected: boolean;
  selectFile: (file: File) => void;
  setIsDrawerOpen: (isOpen: boolean) => void;
  getFileIcon: FileIconGetter;
}

// Helper Functions
export const getFileIcon: FileIconGetter = (fileName = "") => {
  const extension = fileName.split(".").pop()?.toLowerCase() || "";
  return (
    LANGUAGE_ICONS[extension as LanguageIconType] || (
      <FileSearch className="h-5 w-5" />
    )
  );
};

// Components
const FileSearchInput: React.FC<FileSearchInputProps> = ({
  searchTerm,
  setSearchTerm,
  handleCreateFile,
  isCreateDisabled,
}) => (
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
      disabled={isCreateDisabled}
      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400 transition-colors duration-200"
    >
      <Plus className="h-5 w-5" />
    </Button>
  </div>
);

const FileActions: React.FC = () => (
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
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  </div>
);

const FileListItem: React.FC<FileListItemProps> = ({
  file,
  isSelected,
  selectFile,
  setIsDrawerOpen,
  getFileIcon,
}) => (
  <div
    className={`group flex items-center justify-between py-3 px-4 mb-2 rounded-2xl transition-all duration-200 ease-in-out ${
      isSelected
        ? "bg-blue-50 dark:bg-blue-900/30"
        : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
    }`}
  >
    <Link
      href={`?file=${file}`}
      onClick={() => {
        setIsDrawerOpen(false);
        selectFile(file);
      }}
      className="flex items-center space-x-3 flex-grow"
    >
      <div
        className={`p-2 rounded-xl ${
          isSelected
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
    <FileActions />
  </div>
);

const FileList: React.FC<FileListProps> = ({
  files,
  selectedFile,
  selectFile,
  setIsDrawerOpen,
  getFileIcon,
}) => (
  <ScrollArea className="h-[calc(100vh-220px)] pr-4">
    {files.map((file, i) => (
      <FileListItem
        key={i}
        file={file}
        isSelected={selectedFile?.filename === file}
        selectFile={selectFile}
        setIsDrawerOpen={setIsDrawerOpen}
        getFileIcon={getFileIcon}
      />
    ))}
  </ScrollArea>
);

const FileDrawer: React.FC<FileDrawerProps> = () => {
  const searchParams = useSearchParams();
  const groupId = searchParams.get("id") as string;
  const { isdrawerOpen, setIsDrawerOpen } = useToggleStore();
  const [searchTerm, setSearchTerm] = useState<string>("");

  const { files, selectFile, selectedFile, create } = groupId
    ? useGroupFiles(groupId)
    : useUserFiles();

  const filteredFiles = useMemo(
    () =>
      files?.filter((file) =>
        file.toLowerCase().includes(searchTerm.toLowerCase())
      ) || [],
    [files, searchTerm]
  );

  const handleCreateFile = () => {
    if (searchTerm) {
      create(searchTerm);
      setSearchTerm("");
    }
  };

  return (
    <Sheet open={isdrawerOpen}>
      <SheetContent
        className="w-[320px] lg:w-[350px] bg-white dark:bg-gray-900 rounded-r-3xl shadow-2xl border-l border-gray-100 dark:border-gray-800 transition-all duration-300 ease-in-out"
        side="left"
        onMouseEnter={() => setIsDrawerOpen(true)}
        onMouseLeave={() => setIsDrawerOpen(false)}
      >
        <SheetHeader className="pb-8">
          <SheetTitle className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">
            Code<span className="text-blue-500">XF</span>
          </SheetTitle>
          <SheetDescription className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {groupId ? "Group Collaboration" : "Personal Workspace"}
          </SheetDescription>
        </SheetHeader>

        <FileSearchInput
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleCreateFile={handleCreateFile}
          isCreateDisabled={filteredFiles.length > 0}
        />

        <FileList
          files={filteredFiles}
          selectedFile={selectedFile}
          selectFile={selectFile}
          setIsDrawerOpen={setIsDrawerOpen}
          getFileIcon={getFileIcon}
        />
      </SheetContent>
    </Sheet>
  );
};

export default FileDrawer;
