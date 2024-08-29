"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileIcon } from "lucide-react";
import { IconContext } from "react-icons";
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
import { IconType } from "react-icons";

interface Language {
  name: string;
  extension: string;
  icon: IconType;
  color: string;
}

const languages: Language[] = [
  {
    name: "JavaScript",
    extension: "js",
    icon: SiJavascript,
    color: "text-yellow-400",
  },
  {
    name: "TypeScript",
    extension: "ts",
    icon: SiTypescript,
    color: "text-blue-400",
  },
  { name: "React", extension: "jsx", icon: SiReact, color: "text-blue-500" },
  { name: "Python", extension: "py", icon: SiPython, color: "text-green-500" },
  { name: "Rust", extension: "rs", icon: SiRust, color: "text-orange-500" },
  { name: "C++", extension: "cpp", icon: SiCplusplus, color: "text-blue-600" },
  { name: "PHP", extension: "php", icon: SiPhp, color: "text-purple-500" },
  { name: "Java", extension: "java", icon: FaJava, color: "text-red-500" },
  { name: "Go", extension: "go", icon: SiGo, color: "text-blue-300" },
  { name: "Ruby", extension: "rb", icon: SiRuby, color: "text-red-600" },
  {
    name: "Swift",
    extension: "swift",
    icon: SiSwift,
    color: "text-orange-500",
  },
];

interface InitGroupFileProps {
  isOpen: boolean;
  onClose: () => void;
  createFile: (fileName: string) => void;
}

const InitGroupFile: React.FC<InitGroupFileProps> = ({
  isOpen,
  onClose,
  createFile,
}) => {
  const [fileName, setFileName] = useState<string>("");
  const [fileIcon, setFileIcon] = useState<React.ReactNode>(
    <FileIcon className="text-gray-400" />
  );

  useEffect(() => {
    const extension = fileName.split(".").pop();
    const language = languages.find((lang) => lang.extension === extension);
    setFileIcon(
      language ? (
        <IconContext.Provider value={{ className: language.color }}>
          <language.icon />
        </IconContext.Provider>
      ) : (
        <FileIcon className="text-gray-400" />
      )
    );
  }, [fileName]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createFile(fileName);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-700 shadow-lg rounded-lg">
            <DialogHeader>
              <DialogTitle className="text-gray-700 dark:text-gray-200 text-2xl font-semibold">
                Create File
              </DialogTitle>
            </DialogHeader>
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 mt-4"
            >
              <div className="relative">
                <Label
                  htmlFor="fileName"
                  className="text-blue-700 dark:text-blue-300 font-medium"
                >
                  File Name
                </Label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <Input
                    id="fileName"
                    value={fileName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFileName(e.target.value)
                    }
                    className="pr-10 bg-white dark:bg-gray-700 border-blue-200 dark:border-blue-600 focus:border-blue-400 focus:ring-blue-400 rounded-md transition-all duration-200"
                    placeholder="Enter file name (e.g. app.js)"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    {fileIcon}
                  </div>
                </div>
              </div>
              <motion.div
                className="flex justify-end mt-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Button
                  type="submit"
                  className="bg-blue-500 text-white hover:bg-blue-600 transition-all duration-200"
                >
                  Create
                </Button>
              </motion.div>
            </motion.form>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
};
export default InitGroupFile;
