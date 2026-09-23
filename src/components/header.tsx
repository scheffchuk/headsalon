import Image from "next/image";
import Link from "next/link";
import CenterUnderline from "./ui/underline-center";
import { LinkPending } from "./ui/link-pending";
import { TextEffect } from "./ui/text-effect";

export default function Header() {
  return (
    <header className="-mx-4 px-4 pt-10">
      <div className="flex items-center md:items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" prefetch={true}>
            <Image
              src="/logo.svg"
              alt="Logo"
              width={48}
              height={48}
              loading="eager"
            />
          </Link>
          <div className="flex-col hidden md:flex">
            <h1 className="text-2xl font-bold text-foreground">
              海德沙龙
            </h1>
            <TextEffect
              preset="fade-in-blur"
              speedReveal={5}
              speedSegment={0.3}
              className="text-sm text-muted-foreground font-medium"
            >
              A Salon for Heads, No Sofa for Ass
            </TextEffect>
          </div>
        </div>
        <nav className="ml-auto flex items-center text-md font-medium space-x-6 text-foreground">
          <Link
            href="/search"
            prefetch={true}
            className="hover:text-brand focus-visible:text-brand transition-colors duration-200"
            aria-label="搜索"
          >
            <LinkPending>
              <CenterUnderline>搜索</CenterUnderline>
            </LinkPending>
          </Link>
          <Link
            href="/discuss"
            prefetch={true}
            className="hover:text-brand focus-visible:text-brand transition-colors duration-200"
          >
            <LinkPending>
              <CenterUnderline>AI</CenterUnderline>
            </LinkPending>
          </Link>
        </nav>
      </div>
    </header>
  );
}
