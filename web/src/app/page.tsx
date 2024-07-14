"use client";
import { usePathname } from "next/navigation";
import CodeEditor from "@/components/codeEditor/editor";
import ChatSection from "@/components/chat/chat";
import { useEffect } from "react";
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
        <div
          className={`col-span-4 ${
            pathname === "/group" ? "lg:col-span-3 rounded-tr-lg" : "lg:col-span-4"
          } h-[90vh]`}
        >
          <CodeEditor />
        </div>
        <div
          className={`hidden lg:block ${
            pathname !== "/group" && "lg:hidden"
          }  duration-300 transform`}
        >
          <ChatSection />
        </div>
      </div>
    </main>
  );
}
