"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, Plus, FileIcon } from 'lucide-react';
import { SiJavascript, SiTypescript, SiReact, SiPython, SiRust, SiCplusplus, SiPhp, SiGo, SiRuby, SiSwift } from 'react-icons/si';
import { FaJava } from "react-icons/fa";

type SetupType = 'react' | 'next' | 'vue' | 'angular' | 'svelte';

const setupTypes: SetupType[] = ['react', 'next', 'vue', 'angular', 'svelte'];

const languages = [
  { name: 'JavaScript', extension: 'js', icon: <SiJavascript className="text-yellow-400" /> },
  { name: 'TypeScript', extension: 'ts', icon: <SiTypescript className="text-blue-400" /> },
  { name: 'React', extension: 'jsx', icon: <SiReact className="text-blue-500" /> },
  { name: 'Python', extension: 'py', icon: <SiPython className="text-green-500" /> },
  { name: 'Rust', extension: 'rs', icon: <SiRust className="text-orange-500" /> },
  { name: 'C++', extension: 'cpp', icon: <SiCplusplus className="text-blue-600" /> },
  { name: 'PHP', extension: 'php', icon: <SiPhp className="text-purple-500" /> },
  { name: 'Java', extension: 'java', icon: <FaJava className="text-red-500" /> },
  { name: 'Go', extension: 'go', icon: <SiGo className="text-blue-300" /> },
  { name: 'Ruby', extension: 'rb', icon: <SiRuby className="text-red-600" /> },
  { name: 'Swift', extension: 'swift', icon: <SiSwift className="text-orange-500" /> },
];

const AddFileDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState('');
  const [setupType, setSetupType] = useState<SetupType>('react');
  const [fileIcon, setFileIcon] = useState<React.ReactNode>(<FileIcon className="text-gray-400" />);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ fileName, setupType });
    setOpen(false);
  };

  useEffect(() => {
    const extension = fileName.split('.').pop();
    const language = languages.find(lang => lang.extension === extension);
    setFileIcon(language?.icon || <FileIcon className="text-gray-400" />);
  }, [fileName]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-left font-normal bg-blue-50 hover:bg-blue-100 border-blue-200 transition-all duration-200">
          <Plus className="mr-2 h-4 w-4 text-blue-500" />
          <span className="text-gray-800">Setup</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white border-blue-200 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-gray-700 text-2xl font-semibold">Setup</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="file" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-blue-100 rounded-lg p-1">
            <TabsTrigger value="file" className="data-[state=active]:bg-white data-[state=active]:text-blue-700 rounded-md transition-all duration-200">Create File</TabsTrigger>
            <TabsTrigger value="setup" className="data-[state=active]:bg-white data-[state=active]:text-blue-700 rounded-md transition-all duration-200">Setup App</TabsTrigger>
          </TabsList>
          <form onSubmit={handleSubmit}>
            <TabsContent value="file">
              <div className="space-y-4 mt-4">
                <div className="relative">
                  <Label htmlFor="fileName" className="text-blue-700 font-medium">File Name</Label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <Input
                      id="fileName"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      className="pr-10 bg-white border-blue-200 focus:border-blue-400 focus:ring-blue-400 rounded-md transition-all duration-200"
                      placeholder="Enter file name (e.g. app.js)"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      {fileIcon}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="setup">
              <div className="space-y-4 mt-4">
                <Label className="text-blue-700 font-medium">Setup Type</Label>
                <Command className="bg-white border border-blue-200 rounded-md overflow-hidden">
                  <CommandInput placeholder="Search framework..." className="text-blue-700" />
                  <CommandList>
                    <CommandEmpty>No framework found.</CommandEmpty>
                    <CommandGroup heading="Frameworks">
                      {setupTypes.map((type) => (
                        <CommandItem
                          key={type}
                          onSelect={() => setSetupType(type)}
                          className="flex items-center text-blue-700 hover:bg-blue-50 cursor-pointer transition-all duration-200"
                        >
                          {type}
                          <Check
                            className={`ml-auto h-4 w-4 ${setupType === type ? 'opacity-100' : 'opacity-0'}`}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>
            </TabsContent>
            <motion.div 
              className="flex justify-end mt-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Button type="submit" className="bg-blue-500 text-white hover:bg-blue-600 transition-all duration-200">
                Create
              </Button>
            </motion.div>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddFileDialog;