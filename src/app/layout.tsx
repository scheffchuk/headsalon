import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "../providers/convex-client-provider";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HeadSalon",
  description: "A Salon for Heads, No Sofa for Ass",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <div className="max-w-2xl mx-auto py-10 px-4">
          <main>
            <Header />
            <ConvexClientProvider>{children}</ConvexClientProvider>
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
