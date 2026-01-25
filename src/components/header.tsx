import Image from "next/image";
import Link from "next/link";
import CenterUnderline from "./ui/underline-center";
import { TextEffect } from "./ui/text-effect";

export default function Header() {
  return (
    <header className="-mx-4 px-4 pt-10">
      <div className="flex items-center md:items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={48}
              height={48}
            />
          </Link>
          <div className="flex-col hidden md:flex">
            <h1 className=" text-2xl font-bold text-gray-800">
              海德沙龙
            </h1>
            <TextEffect
              preset="fade-in-blur"
              speedReveal={5}
              speedSegment={0.3}
              className="text-sm text-gray-600 font-medium"
            >
              A Salon for Heads, No Sofa for Ass
            </TextEffect>
          </div>
        </div>
        <nav className="ml-auto flex items-center text-md font-medium space-x-6 text-gray-800">
          <Link
            href="/search"
            className="hover:text-[#3399ff] transition-colors duration-200"
            aria-label="搜索"
          >
            <CenterUnderline>搜索</CenterUnderline>
          </Link>
          {/* <Link
            href="/flashing"
            className="hover:text-[#3399ff] transition-colors duration-200"
            aria-label="刷机包"
          >
            <CenterUnderline>刷机包</CenterUnderline>
          </Link> */}
          {/* <Link
            href="/about"
            className="hover:text-[#3399ff] transition-colors duration-200"
          >
            <CenterUnderline>关于</CenterUnderline>
          </Link> */}
          <Link
            href="/discuss"
            className="hover:text-[#3399ff] transition-colors duration-200"
          >
            <CenterUnderline>AI</CenterUnderline>
          </Link>
        </nav>
      </div>
    </header>
  );
}
