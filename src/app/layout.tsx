import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/assets/Lijun Fang, Series 1, No. 6.jpg";

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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="max-w-2xl mx-auto py-10 px-4">
          <header>
            <div className="flex items-center justify-between">
              <Link href="/">
                <Image
                  src={Logo}
                  alt="Logo"
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              </Link>
              <nav className="ml-auto text-md font-medium space-x-6 text-gray-950">
                <Link href="/about" className="hover:underline hover:text-[#3399ff]">About</Link>
                <Link href="/chatbot" className="hover:underline hover:text-[#3399ff]">ChatBot</Link>
              </nav>
            </div>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
