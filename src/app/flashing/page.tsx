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
            <Suspense
              fallback={
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-600">
                    正在生成刷机包...
                  </span>
                </div>
              }
            >
              <HeadSalonRom />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
