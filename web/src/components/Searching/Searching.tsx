import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  usePathname,
  useSearchParams,
  useRouter,
  useParams,
} from "next/navigation";
import Link from "next/link";
import { Trash2, ArrowDownToLine, Plus, FileSearch } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
import { useFiles } from "@/hooks";
import { LanguageIconType, LANGUAGE_ICONS } from "../constants";
type FileName = string;

interface FileProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TooltipButtonProps {
  icon: React.ReactNode;
  tooltip: string;
  className?: string;
  onClick?: () => void;
}

interface CreateButtonProps {
  onClick: () => void;
  disabled: boolean;
}

type FileIconGetter = (fileName: string) => JSX.Element;

// Components
export const getFileIcon: FileIconGetter = (fileName = "") => {
  const extension = fileName.split(".").pop()?.toLowerCase() || "";
  return (
    LANGUAGE_ICONS[extension as LanguageIconType] || (
      <FileSearch className="h-5 w-5" />
    )
  );
};
const ItemActions: React.FC = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex items-center space-x-1"
  >
    <TooltipButton
      icon={<ArrowDownToLine className="h-4 w-4" />}
      tooltip="Download"
    />
    <TooltipButton
      icon={<Trash2 className="h-4 w-4" />}
      tooltip="Delete"
      className="hover:text-red-500 dark:hover:text-red-400"
    />
  </motion.div>
);

const TooltipButton: React.FC<TooltipButtonProps> = ({
  icon,
  tooltip,
  className,
  onClick,
}) => (
  <Tooltip>
    <TooltipTrigger>
      <Button
        size="sm"
        variant="ghost"
        className={cn(
          "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-full",
          className
        )}
        onClick={onClick}
      >
        {icon}
      </Button>
    </TooltipTrigger>
    <TooltipContent>{tooltip}</TooltipContent>
  </Tooltip>
);

const CreateButton: React.FC<CreateButtonProps> = ({ onClick, disabled }) => (
  <Tooltip>
    <TooltipTrigger>
      <Button
        size="icon"
        variant="ghost"
        onClick={onClick}
        disabled={disabled}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400 transition-colors duration-200"
      >
        <Plus
          className={`h-5 w-5 ${disabled ? "text-gray-400" : "text-blue-600"}`}
        />
      </Button>
    </TooltipTrigger>
    <TooltipContent>Create</TooltipContent>
  </Tooltip>
);

const FileItem: React.FC<{ fileName: FileName; onSelect: () => void }> = ({
  fileName,
  onSelect,
}) => (
  <CommandItem
    className="flex items-center justify-between space-x-2 px-4 py-2 cursor-pointer transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
    onSelect={onSelect}
  >
    <Link href={`#${fileName}`} className="flex items-center gap-2">
      {getFileIcon(fileName)}
      <span className="text-1xl font-medium text-gray-700 dark:text-gray-300">
        {fileName}
      </span>
    </Link>
    <ItemActions />
  </CommandItem>
);

const Searching: React.FC<FileProjectDialogProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { id: groupId } = useParams<{ id: string }>();

  const { createFile, selectFile, files } = useFiles(
    groupId ? "group" : "user"
  );

  const filteredFiles = useMemo(() => {
    return files.filter((fileName) =>
      fileName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [files, searchQuery]);

  const handleCreateFile = () => {
    if (searchQuery.trim() !== "") {
      createFile(searchQuery);
      setSearchQuery("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filteredFiles.length === 0) {
        handleCreateFile();
      } else {
        selectFile(filteredFiles[0]);
        router.push(`#${filteredFiles[0]}`);
        onClose();
      }
    }
  };

  return (
    <TooltipProvider>
      <AnimatePresence>
        {isOpen && (
          <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-0 w-full max-w-[800px] max-h-[600px] h-[600px]">
              <Command className="rounded-lg border border-gray-200 dark:border-gray-700 w-full">
                <div className="relative mb-2">
                  <CommandInput
                    placeholder="Search files..."
                    className="dark:bg-gray-800 dark:text-gray-300 w-full"
                    value={searchQuery}
                    onKeyDown={handleKeyDown}
                    onValueChange={setSearchQuery}
                  />
                  <CreateButton
                    onClick={handleCreateFile}
                    disabled={filteredFiles.length > 0}
                  />
                </div>
                <ScrollArea className="h-full w-[98%] m-auto border rounded-md">
                  <CommandList>
                    <CommandEmpty>
                      No results found. Press Enter to create a new file.
                    </CommandEmpty>
                    <CommandGroup>
                      {filteredFiles.map((fileName, i) => (
                        <FileItem
                          key={i}
                          fileName={fileName}
                          onSelect={() => {
                            selectFile(fileName);
                            onClose();
                          }}
                        />
                      ))}
                    </CommandGroup>
                  </CommandList>
                </ScrollArea>
              </Command>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </TooltipProvider>
  );
};

export default Searching;
