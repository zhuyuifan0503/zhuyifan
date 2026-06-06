import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="font-semibold text-gray-900 text-sm">
              ⚙️ 管理后台
            </Link>
            <Link
              href="/admin/import"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              导入内容
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
              查看网站 →
            </Link>
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                className="text-sm text-red-500 hover:text-red-700"
              >
                退出登录
              </button>
            </form>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
