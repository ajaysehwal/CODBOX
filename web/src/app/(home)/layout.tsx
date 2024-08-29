import type { Metadata } from "next";
import "../globals.css";
import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/context";
import "react-toastify/dist/ReactToastify.css";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "CODBOX | Collaborative Coding Made Easy",
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
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
