"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useToggleStore } from "@/zustand";
import CodeEditor from "@/components/Editor";
import Right from "@/components/sidebars/Right";
import Left from "@/components/sidebars/Left";
import Searching from "@/components/Searching/Searching";
import { Button } from "@/components/ui/button";
import { useHashRoute } from "@/hooks/usehashRoute";
import { useFiles } from "@/hooks";
import { useSocket } from "@/context";
import { useParams } from "next/navigation";

const Playground: React.FC = () => {
  const routeFile = useHashRoute();
  const { id: groupId } = useParams<{ id: string }>();
  const [isMobile, setIsMobile] = useState(false);
  const { setIsDrawerOpen, setIsOpenSearchBox, isOpenSearchBox } =
    useToggleStore();
  const { socket } = useSocket();
  const { getFiles, context } = useFiles(groupId ? "group" : "user");

  const openSearchDialog = useCallback(
    () => setIsOpenSearchBox(true),
    [setIsOpenSearchBox]
  );
  const closeSearchDialog = useCallback(
    () => setIsOpenSearchBox(false),
    [setIsOpenSearchBox]
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!routeFile && !groupId) {
      openSearchDialog();
    }
  }, [routeFile, groupId, openSearchDialog]);

  useEffect(() => {
    const timer = setTimeout(() => console.clear(), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    getFiles();
  }, [socket, getFiles, context]);

  const toggleMobileSidebar = () => {};

  return (
    <>
      <main className="relative w-full h-[90vh] bg-gray-100 overflow-hidden">
        <LeftSidebar setIsDrawerOpen={setIsDrawerOpen} />
        <div className="flex w-full h-full">
          <CodeEditorSection isGroup={typeof groupId === "string"} />
          {!isMobile && <RightSidebar />}
        </div>
        {isMobile && groupId && (
          <MobileSidebarToggle onClick={toggleMobileSidebar} />
        )}
      </main>
      <Searching isOpen={isOpenSearchBox} onClose={closeSearchDialog} />
    </>
  );
};

const LeftSidebar: React.FC<{ setIsDrawerOpen: (isOpen: boolean) => void }> = ({
  setIsDrawerOpen,
}) => (
  <div
    className="absolute bg-transparent w-2 h-full top-0 left-0 z-50 cursor-pointer transition-all duration-300 hover:w-4"
    onMouseEnter={() => setIsDrawerOpen(true)}
    onMouseLeave={() => setIsDrawerOpen(false)}
  >
    <Left />
  </div>
);

const CodeEditorSection: React.FC<{ isGroup: boolean }> = ({ isGroup }) => (
  <div className="flex-grow h-full overflow-hidden">
    <CodeEditor isGroup={isGroup} />
  </div>
);

const RightSidebar: React.FC = () => (
  <div className="w-16 lg:w-20 transition-all duration-300 transform bg-white">
    <Right />
  </div>
);

const MobileSidebarToggle: React.FC<{ onClick: () => void }> = ({
  onClick,
}) => (
  <div className="fixed bottom-6 right-6 z-50">
    <Button
      className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110"
      onClick={onClick}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16m-7 6h7"
        />
      </svg>
    </Button>
  </div>
);

export default Playground;
