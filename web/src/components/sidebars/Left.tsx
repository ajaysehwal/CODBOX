import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
import { useFiles } from "@/hooks";
import {
  ArrowDownToLine,
  Plus,
  Trash2,
  FileSearch,
  Folder,
  User,
} from "lucide-react";
import { LANGUAGE_ICONS, LanguageIconType } from "@/components/constants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Type definitions
type File = {
  filename: string;
  content: string;
};

type FileIconGetter = (fileName?: string) => React.ReactNode;

interface FileSearchInputProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleCreateFile: () => void;
  isCreateDisabled: boolean;
}

interface FileListItemProps {
  file: string;
  isSelected: boolean;
  selectFile: (file: string) => void;
  setIsDrawerOpen: (isOpen: boolean) => void;
  getFileIcon: FileIconGetter;
}

interface FileListProps {
  files: string[];
  selectedFile: File | null;
  selectFile: (file: string) => void;
  setIsDrawerOpen: (isOpen: boolean) => void;
  getFileIcon: FileIconGetter;
}

interface FileDrawerProps {}

// Helper Functions
export const getFileIcon: FileIconGetter = (fileName = "index.js") => {
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
  <div className="relative mb-6">
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
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex items-center space-x-1"
  >
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
  </motion.div>
);

const FileListItem: React.FC<FileListItemProps> = ({
  file,
  isSelected,
  selectFile,
  setIsDrawerOpen,
  getFileIcon,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.2 }}
    className={`group flex items-center justify-between py-3 px-4 mb-2 rounded-2xl transition-all duration-200 ease-in-out ${
      isSelected
        ? "bg-blue-50 dark:bg-blue-900/30"
        : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
    }`}
  >
    <Link
      href={`#${file}`}
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
    <AnimatePresence>{isSelected && <FileActions />}</AnimatePresence>
  </motion.div>
);

const FileList: React.FC<FileListProps> = ({
  files,
  selectedFile,
  selectFile,
  setIsDrawerOpen,
  getFileIcon,
}) => (
  <ScrollArea className="h-[calc(100vh-280px)] pr-4">
    <AnimatePresence>
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
    </AnimatePresence>
  </ScrollArea>
);

const FileDrawer: React.FC<FileDrawerProps> = () => {
  const { id: groupId } = useParams<{ id: string }>();
  const { isdrawerOpen, setIsDrawerOpen } = useToggleStore();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"group" | "user">("group");

  const {
    files: groupFiles,
    selectFile: selectGroupFile,
    file: groupFile,
    createFile: createGroupFile,
  } = useFiles("group");
  const {
    files: userFiles,
    selectFile: selectUserFile,
    file: userFile,
    createFile: createUserFile,
  } = useFiles("user");

  const filteredGroupFiles = useMemo(
    () =>
      groupFiles?.filter((file) =>
        file.toLowerCase().includes(searchTerm.toLowerCase())
      ) || [],
    [groupFiles, searchTerm]
  );

  const filteredUserFiles = useMemo(
    () =>
      userFiles?.filter((file) =>
        file.toLowerCase().includes(searchTerm.toLowerCase())
      ) || [],
    [userFiles, searchTerm]
  );

  const handleCreateFile = () => {
    if (searchTerm) {
      if (groupId && activeTab === "group") {
        createGroupFile(searchTerm);
      } else {
        createUserFile(searchTerm);
      }
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
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <SheetHeader className="pb-6">
            <SheetTitle className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">
              COD<span className="text-blue-500">BOX</span>
            </SheetTitle>
            <SheetDescription className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {groupId ? "Group Collaboration" : "Personal Workspace"}
            </SheetDescription>
          </SheetHeader>

          {groupId ? (
            <Tabs
              defaultValue="group"
              className="w-full"
              onValueChange={(value) => setActiveTab(value as "group" | "user")}
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger
                  value="group"
                  className="flex items-center space-x-2"
                >
                  <Folder className="w-4 h-4" />
                  <span>Group Files</span>
                </TabsTrigger>
                <TabsTrigger
                  value="user"
                  className="flex items-center space-x-2"
                >
                  <User className="w-4 h-4" />
                  <span>My Files</span>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="group">
                <FileSearchInput
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  handleCreateFile={handleCreateFile}
                  isCreateDisabled={filteredGroupFiles.length > 0}
                />
                <FileList
                  files={filteredGroupFiles}
                  selectedFile={groupFile}
                  selectFile={selectGroupFile}
                  setIsDrawerOpen={setIsDrawerOpen}
                  getFileIcon={getFileIcon}
                />
              </TabsContent>
              <TabsContent value="user">
                <FileSearchInput
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  handleCreateFile={handleCreateFile}
                  isCreateDisabled={filteredUserFiles.length > 0}
                />
                <FileList
                  files={filteredUserFiles}
                  selectedFile={userFile}
                  selectFile={selectUserFile}
                  setIsDrawerOpen={setIsDrawerOpen}
                  getFileIcon={getFileIcon}
                />
              </TabsContent>
            </Tabs>
          ) : (
            <>
              <FileSearchInput
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                handleCreateFile={handleCreateFile}
                isCreateDisabled={filteredUserFiles.length > 0}
              />
              <FileList
                files={filteredUserFiles}
                selectedFile={userFile}
                selectFile={selectUserFile}
                setIsDrawerOpen={setIsDrawerOpen}
                getFileIcon={getFileIcon}
              />
            </>
          )}
        </motion.div>
      </SheetContent>
    </Sheet>
  );
};

export default FileDrawer;
