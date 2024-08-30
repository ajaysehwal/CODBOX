import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import { AuthProvider, SocketProvider } from "@/context";
import Navbar from "@/components/navbar/Navbar";
import { Toaster } from "@/components/ui/toaster";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../globals.css";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Playground | CODBOX",
  description:
    "Access CODBOX's interactive playground for real-time collaborative coding. Share, edit, and run code together in a seamless development environment.",
  keywords:
    "coding playground, collaborative IDE, real-time coding, code sharing, pair programming",
  openGraph: {
    title: "CODBOX Playground | Collaborative Coding Environment",
    description:
      "Access CODBOX's interactive playground for real-time collaborative coding. Share, edit, and run code together in a seamless development environment.",
    url: "https://codbox.vercel.app/playground",
    siteName: "CODBOX",
    images: [
      {
        url: "https://codbox.vercel.app/playground-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "CODBOX Collaborative Coding Playground",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CODBOX Playground | Collaborative Coding Environment",
    description:
      "Access CODBOX's interactive playground for real-time collaborative coding. Share, edit, and run code together in a seamless development environment.",
    images: ["https://codbox.vercel.app/playground-og-image.jpg"],
  },
  robots: "index, follow",
  alternates: {
    canonical: "https://codbox.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: `
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "CODBOX Playground",
            "url": "https://codbox.vercel.app/playground",
            "description": "Access CODBOX's interactive playground for real-time collaborative coding. Share, edit, and run code together in a seamless development environment.",
            "applicationCategory": "DeveloperApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0"
            }
          }
        `,
          }}
        />
      </head>
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
