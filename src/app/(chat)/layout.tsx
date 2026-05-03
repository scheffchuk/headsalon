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
          className="fixed top-6 left-6 z-50 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
