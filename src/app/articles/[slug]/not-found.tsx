import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="text-center py-16">
      <h1 className="text-4xl font-bold text-foreground mb-4">
        文章未找到
      </h1>
      <p className="text-muted-foreground mb-8">
        抱歉，您要查找的文章不存在或已被删除。
      </p>
      <Button asChild>
        <Link href="/">← 返回首页</Link>
      </Button>
    </div>
  );
}
