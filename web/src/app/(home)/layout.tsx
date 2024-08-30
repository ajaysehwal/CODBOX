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
  description:
    "Experience seamless collaborative coding with CODBOX. Our platform offers real-time collaboration, powerful tools, and an intuitive interface for developers of all levels.",
  keywords:
    "collaborative coding, real-time collaboration, code sharing, pair programming, developer tools",
  openGraph: {
    title: "CODBOX | Collaborative Coding Made Easy",
    description:
      "Experience seamless collaborative coding with CODBOX. Our platform offers real-time collaboration, powerful tools, and an intuitive interface for developers of all levels.",
    url: "https://codbox.vercel.app",
    siteName: "CODBOX",
    images: [
      {
        url: "https://codbox.vercel.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "CODBOX Collaborative Coding Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CODBOX | Collaborative Coding Made Easy",
    description:
      "Experience seamless collaborative coding with CODBOX. Real-time collaboration, powerful tools, and an intuitive interface for all developers.",
    images: ["https://codbox.vercel.app/twitter-image.jpg"],
    creator: "@codbox",
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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <AuthProvider>
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
