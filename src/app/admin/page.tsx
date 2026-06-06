import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "管理后台 — 内容仓库",
};

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin_token")?.value;
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  if (adminToken !== adminPassword) {
    redirect("/admin/login");
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">⚙️ 管理后台</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Import ChatGPT */}
        <Link
          href="/admin/import"
          className="block p-6 rounded-xl border border-gray-200 bg-white hover:border-blue-300 hover:shadow-md transition-all"
        >
          <div className="text-3xl mb-3">📥</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            导入 ChatGPT 对话
          </h2>
          <p className="text-sm text-gray-600">
            上传从 ChatGPT 导出的 JSON 文件，或手动粘贴对话内容。
            支持批量导入和单条添加。
          </p>
        </Link>

        {/* Add Article */}
        <Link
          href="/admin/import?tab=article"
          className="block p-6 rounded-xl border border-gray-200 bg-white hover:border-blue-300 hover:shadow-md transition-all"
        >
          <div className="text-3xl mb-3">✍️</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            添加文章 & 文案
          </h2>
          <p className="text-sm text-gray-600">
            手动添加公众号文章或小红书文案。
            支持标题、内容、标签和封面图。
          </p>
        </Link>

        {/* Browse */}
        <Link
          href="/chatgpt"
          className="block p-6 rounded-xl border border-gray-200 bg-white hover:border-blue-300 hover:shadow-md transition-all"
        >
          <div className="text-3xl mb-3">💬</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            浏览 ChatGPT 对话
          </h2>
          <p className="text-sm text-gray-600">
            查看所有已导入的 ChatGPT 对话记录。
          </p>
        </Link>

        {/* Browse articles */}
        <Link
          href="/articles"
          className="block p-6 rounded-xl border border-gray-200 bg-white hover:border-blue-300 hover:shadow-md transition-all"
        >
          <div className="text-3xl mb-3">📄</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            浏览文章 & 文案
          </h2>
          <p className="text-sm text-gray-600">
            查看所有已保存的公众号文章和小红书文案。
          </p>
        </Link>
      </div>
    </div>
  );
}
