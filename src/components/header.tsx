import Image from "next/image";
import Link from "next/link";
import React from "react";
import CenterUnderline from "./ui/underline-center";
import Logo from "@/assets/logo.png";

export default function Header() {
  return (
    <header>
      <div className="flex items-center justify-between pt-10">
        <Link href="/">
          <Image
            src={Logo}
            alt="Logo"
            width={48}
            height={48}
            loading="lazy"
            placeholder="blur"
            className="rounded-full"
          />
        </Link>
        <nav className="ml-auto flex items-center text-md font-medium space-x-6 text-gray-700">
          <Link
            href="/search"
            className="hover:text-[#3399ff] transition-colors duration-200"
            aria-label="搜索"
          >
            <CenterUnderline>Search</CenterUnderline>
          </Link>
          <Link
            href="/flashing"
            className="hover:text-[#3399ff] transition-colors duration-200"
            aria-label="刷机包"
          >
            <CenterUnderline>Flashing</CenterUnderline>
          </Link>
          <Link
            href="/about"
            className="hover:text-[#3399ff] transition-colors duration-200"
          >
            <CenterUnderline>About</CenterUnderline>
          </Link>
          <Link
            href="/discuss"
            className="hover:text-[#3399ff] transition-colors duration-200"
          >
            <CenterUnderline>Discuss</CenterUnderline>
          </Link>
        </nav>
      </div>
    </header>
  );
}
