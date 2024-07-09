import type { Metadata } from "next";
import "./globals.css";
import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import { AuthProvider, SocketProvider } from "@/context";
import Navbar from "@/components/navbar/navbar";
import { Toaster } from "@/components/ui/toaster";
const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "SyncCode | Collaborative Coding Made Easy",
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
            {children}
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
