import { Suspense } from "react";
import { HeadSalonRom } from "@/components/rom";

export default function RoadmapPage() {
  return (
    <div className="pt-16">
      <main>
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-4">海德沙龙刷机包</h1>
        </header>
        <div>
          {/* Roadmap Component */}
          <div className=" items-center justify-center">
            <HeadSalonRom />
          </div>
        </div>
      </main>
    </div>
  );
}
