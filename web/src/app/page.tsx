"use client";
import { usePathname } from "next/navigation";
import CodeEditor from "@/components/codeEditor/editor";
import ChatSection from "@/components/chat/chat";
import { useEffect } from "react";
import PreviousNotes from "@/components/history/PreviousNotes";
export default function Home() {
  const pathname = usePathname();
  useEffect(() => {
    setTimeout(() => {
      console.clear();
    }, 50);
  }, []);
  return (
    <main className="relative w-full">
      <div className="grid grid-cols-4 w-full">
        <div className="col-span-3 h-[90vh]">
          <CodeEditor />
        </div>
        {pathname === "/group" ? (
          <div className="hidden lg:block duration-300 transform">
            <ChatSection />
          </div>
        ) : (
          <div className="duration-300 transform">
            <PreviousNotes />
          </div>
        )}
      </div>
    </main>
  );
}
