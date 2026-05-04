import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh">
      {/* sidebar slot — enable when thread history is ready */}
      {/* <aside className="hidden md:flex w-72 shrink-0 flex-col border-r">{sidebar}</aside> */}

      <div className="relative flex flex-1 flex-col min-w-0">
        {children}

        <Link
          href="/"
          className="fixed top-4 left-4 z-50 inline-flex items-center gap-2 rounded-sm p-2 font-medium text-foreground shadow-sm ring-primary/5 backdrop-blur-3xl transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring bg-background/80"
        >
          <ArrowLeftIcon aria-hidden className="size-4 shrink-0" />
        </Link>
      </div>
    </div>
  );
}
