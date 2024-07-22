// "use client";
// import { usePathname } from "next/navigation";
// import CodeEditor from "@/components/codeEditor/editor";
// import ChatSection from "@/components/chat/chat";
// import { useEffect } from "react";
// import PreviousNotes from "@/components/history/PreviousNotes";
// import Right from "@/components/sidebars/Right";
// export default function Home() {
//   const pathname = usePathname();
//   useEffect(() => {
//     setTimeout(() => {
//       console.clear();
//     }, 50);
//   }, []);
//   return (
//     <main className="relative w-full">
//       <div className="grid grid-cols-8 w-full">
//         <div className="col-span-7  h-[90vh]">
//           <CodeEditor />
//         </div>
//         {pathname === "/group" ? (
//           <div className="hidden lg:block duration-300 transform">
//             <Right />
//           </div>
//         ) : (
//           <div className="duration-300 transform">
//             <PreviousNotes />
//           </div>
//         )}
//       </div>
//     </main>
//   );
// }

"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import CodeEditor from "@/components/codeEditor/editor";
import ChatSection from "@/components/chat/chat";
import PreviousNotes from "@/components/history/PreviousNotes";
import Right from "@/components/sidebars/Right";

export default function Home() {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

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
    <main className="relative w-full">
      <div className="flex w-full">
        <div className="flex-grow w-full lg:w-[93%] h-[90vh]">
          <CodeEditor />
        </div>
        {!isMobile && (
          <div className="w-[7%] transition-all duration-300 transform">
            <Right />
          </div>
        )}
      </div>
      {isMobile && pathname === "/group" && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg"
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
