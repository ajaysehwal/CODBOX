import type { Metadata } from "next";
import "../../globals.css";
import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import { AuthProvider, SocketProvider } from "@/context";
import Navbar from "@/components/navbar/Navbar";
import { Toaster } from "@/components/ui/toaster";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "CODBOX | Playground",
  description: "Collaborative Coding Made Easy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <AuthProvider>
          <SocketProvider>
              <Navbar />
              <Toaster />
              <ToastContainer />
              {children}
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
