import Header from "@/components/header";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-3xl mx-auto px-4">
      <main>
        <Header />
        {children}
      </main>
    </div>
  );
}
