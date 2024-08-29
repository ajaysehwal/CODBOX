import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { File, Folder, Trash2, ArrowDownToLine, Plus } from "lucide-react";
import {
  SiJavascript,
  SiTypescript,
  SiReact,
  SiPython,
  SiRust,
  SiCplusplus,
  SiPhp,
  SiGo,
  SiRuby,
  SiSwift,
} from "react-icons/si";
import { FaJava } from "react-icons/fa";

const languageIcons: { [key: string]: React.ReactElement } = {
  javascript: <SiJavascript className="text-yellow-400" />,
  typescript: <SiTypescript className="text-blue-400" />,
  react: <SiReact className="text-blue-500" />,
  python: <SiPython className="text-green-500" />,
  rust: <SiRust className="text-orange-500" />,
  "c++": <SiCplusplus className="text-blue-600" />,
  php: <SiPhp className="text-purple-500" />,
  java: <FaJava className="text-red-500" />,
  go: <SiGo className="text-blue-300" />,
  ruby: <SiRuby className="text-red-600" />,
  swift: <SiSwift className="text-orange-500" />,
};

interface FileOrProject {
  id: string;
  name: string;
  type: "file" | "project";
  language?: string;
}

interface FileProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFile: (name: string, language: string) => void;
  onDelete: (id: string) => void;
  onDownload: (id: string) => void;
}

const files: FileOrProject[] = [
  { id: "1", name: "main.js", type: "file", language: "JavaScript" },
  { id: "2", name: "main.cpp", type: "file", language: "C++" },
  { id: "3", name: "index.ts", type: "file", language: "TypeScript" },
  { id: "4", name: "app.py", type: "file", language: "Python" },
];

const projects: FileOrProject[] = [
  { id: "5", name: "Project A", type: "project" },
  { id: "6", name: "Project B", type: "project" },
  { id: "7", name: "Project C", type: "project" },
];

const getLanguageIcon = (language: string) =>
  languageIcons[language.toLowerCase()] || <File className="text-gray-400" />;

const ItemIcon: React.FC<{ item: FileOrProject }> = ({ item }) => (
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.2 }}
    className="w-6 h-6"
  >
    {item.type === "file" ? (
      getLanguageIcon(item.language || "")
    ) : (
      <Folder className="text-yellow-500" />
    )}
  </motion.div>
);

const ItemActions: React.FC<{
  item: FileOrProject;
  onDownload: () => void;
  onDelete: () => void;
}> = ({ item, onDownload, onDelete }) => (
  <div
    className={cn(
      "flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
    )}
  >
    <Tooltip>
      <TooltipTrigger>
        <Button
          size="sm"
          variant="ghost"
          className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-full"
          onClick={onDownload}
        >
          <ArrowDownToLine className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Download</TooltipContent>
    </Tooltip>
    <Tooltip>
      <TooltipTrigger>
        <Button
          size="sm"
          variant="ghost"
          className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 rounded-full"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Delete</TooltipContent>
    </Tooltip>
  </div>
);

const FileProjectDialog: React.FC<FileProjectDialogProps> = ({
  isOpen,
  onClose,
  onCreateFile,
  onDelete,
  onDownload,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [newFileLanguage, setNewFileLanguage] = useState("javascript");

  const filteredItems = [...files, ...projects].filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateFile = () => {
    if (newFileName.trim() !== "") {
      onCreateFile(newFileName, newFileLanguage);
      setNewFileName("");
    }
  };

  return (
    <TooltipProvider>
      <AnimatePresence>
        {isOpen && (
          <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-0 w-full max-w-[800px] max-h-[600px]">
              <div className="p-4">
                <Command className="rounded-lg border border-gray-200 dark:border-gray-700 w-full">
                  <div className="relative mb-2">
                    <CommandInput
                      placeholder="Search files and projects..."
                      className="dark:bg-gray-800 dark:text-gray-300 w-full"
                      value={searchQuery}
                      onValueChange={(e) => setSearchQuery(e)}
                    />
                    <Tooltip>
                      <TooltipTrigger className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400 transition-colors duration-200">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={handleCreateFile}
                          className=""
                          disabled={filteredItems.length === 0}
                        >
                          <Plus
                            className={`h-5 w-5 ${
                              filteredItems.length === 0
                                ? "text-blue-600"
                                : "text-gray-400"
                            }`}
                          />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Create</TooltipContent>
                    </Tooltip>
                  </div>
                  <ScrollArea className="h-[400px] w-full">
                    <CommandList>
                      {filteredItems.length === 0 ? (
                        <CommandEmpty>
                          No results found. you can create new file
                        </CommandEmpty>
                      ) : (
                        <CommandGroup>
                          {filteredItems.map((item) => (
                            <CommandItem
                              key={item.id}
                              className={cn(
                                "flex items-center justify-between space-x-2 px-4 py-2 cursor-pointer transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                              )}
                            >
                              <div className="flex items-center space-x-2">
                                <ItemIcon item={item} />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {item.name}
                                </span>
                              </div>
                              <ItemActions
                                item={item}
                                onDownload={() => onDownload(item.id)}
                                onDelete={() => onDelete(item.id)}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </ScrollArea>
                </Command>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </TooltipProvider>
  );
};

export default FileProjectDialog;
