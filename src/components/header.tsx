import Image from "next/image";
import Link from "next/link";
import React from "react";
import Logo from "@/assets/Lijun Fang, Series 1, No. 6.jpg";

export default function Header() {
  return (
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
        <nav className="ml-auto text-md font-medium space-x-6 text-gray-700">
          <Link href="/about" className="hover:underline hover:text-[#3399ff]">
            About
          </Link>
          <Link href="/" className="hover:underline hover:text-[#3399ff]">
            Discuss
          </Link>
        </nav>
      </div>
    </header>
  );
}
