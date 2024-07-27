"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Editor from "@/components/Editor/editor";
import Right from "@/components/sidebars/Right";
import { useDrawerStore } from "@/zustand";
import Left from "@/components/sidebars/Left";

export default function Home() {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const { setDrawerOpen } = useDrawerStore();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      console.clear();
    }, 50);
  }, []);

  return (
    <main className="relative w-full h-[90vh] bg-gray-100 overflow-hidden">
      <div
        className="absolute bg-transparent w-2 h-full top-0 left-0 z-50 cursor-pointer transition-all duration-300 hover:w-4"
        onMouseEnter={() => setDrawerOpen(true)}
        onMouseLeave={() => setDrawerOpen(false)}
      >
        <Left />
      </div>
      <div className="flex w-full h-full">
        <div className="flex-grow h-full overflow-hidden">
          <Editor />
        </div>
        {!isMobile && (
          <div className="w-16 lg:w-20 transition-all duration-300 transform bg-white">
            <Right />
          </div>
        )}
      </div>
      {isMobile && pathname === "/group" && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110"
            onClick={() => {
              /* Toggle mobile sidebar */
            }}
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
          </button>
        </div>
      )}
    </main>
  );
}
