import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

function MaintenanceTapeBar({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "h-3.5 w-full shrink-0 border-black/15 shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.06)]",
        "bg-[repeating-linear-gradient(135deg,#facc15_0px,#facc15_9px,#1c1917_9px,#1c1917_18px)]",
        "dark:bg-[repeating-linear-gradient(135deg,#ca8a04_0px,#ca8a04_9px,#0a0a0a_9px,#0a0a0a_18px)]",
        "dark:border-white/10",
        className,
      )}
    />
  );
}

export default function ChatMaintenance() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4">
      <Card className="max-w-xl w-full overflow-hidden p-0 gap-0 shadow-md">
        <MaintenanceTapeBar />

        <CardHeader className="px-6 pt-6 pb-6">
          <CardTitle className="text-xl">AI 对话暂不可用</CardTitle>
          <CardDescription className="text-base pt-2 space-y-2">
            <p>由于 API 服务商问题，AI 对话功能已暂时关闭，正在想办法恢复。</p>
            <p className="text-muted-foreground/90">
              AI chat is disabled due to an issue with our API provider.
              {" "}
              {"I'm working on restoring it as soon as possible."}
            </p>
          </CardDescription>
        </CardHeader>
        <MaintenanceTapeBar className="border-t border-black/10 dark:border-white/10" />
      </Card>
    </div>
  );
}
