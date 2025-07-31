import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-center py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        文章未找到
      </h1>
      <p className="text-gray-600 mb-8">
        抱歉，您要查找的文章不存在或已被删除。
      </p>
      <Link 
        href="/"
        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        ← 返回首页
      </Link>
    </div>
  );
}