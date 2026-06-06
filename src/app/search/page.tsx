import Link from "next/link";
import { searchConversations, searchArticles } from "@/lib/supabase";

export const metadata = {
  title: "搜索 — 内容仓库",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || "";

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const configured = supabaseUrl && !supabaseUrl.includes("your-project-id");

  let chatResults: Awaited<ReturnType<typeof searchConversations>> = [];
  let articleResults: Awaited<ReturnType<typeof searchArticles>> = [];

  if (configured && query.trim()) {
    try {
      [chatResults, articleResults] = await Promise.all([
        searchConversations(query.trim()),
        searchArticles(query.trim()),
      ]);
    } catch {
      // error
    }
  }

  const hasQuery = query.trim().length > 0;
  const totalResults = chatResults.length + articleResults.length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">🔍 搜索</h1>

      {/* Search form */}
      <form action="/search" method="get" className="mb-10">
        <div className="flex gap-3">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="搜索对话内容、文章..."
            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
            autoFocus
          />
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
          >
            搜索
          </button>
        </div>
      </form>

      {/* Results */}
      {!configured ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-400 text-lg">请先配置 Supabase</p>
        </div>
      ) : !hasQuery ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-400 text-lg">输入关键词搜索全部内容</p>
          <p className="text-gray-400 text-sm mt-1">
            支持搜索 ChatGPT 对话和公众号/小红书文案
          </p>
        </div>
      ) : totalResults === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-400 text-lg">未找到匹配结果</p>
          <p className="text-gray-400 text-sm mt-1">试试其他关键词</p>
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-500 mb-6">
            找到 {totalResults} 条结果
          </p>

          {chatResults.length > 0 && (
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                💬 ChatGPT 对话 ({chatResults.length})
              </h2>
              <div className="space-y-3">
                {chatResults.map((c) => (
                  <Link
                    key={c.id}
                    href={`/chatgpt/${c.id}`}
                    className="block p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all bg-white"
                  >
                    <h3 className="font-medium text-gray-900">
                      {c.title || "未命名对话"}
                    </h3>
                    <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-500">
                      <span>💬 {c.message_count} 条消息</span>
                      {c.model && <span>{c.model}</span>}
                      <span>
                        {new Date(c.created_at).toLocaleDateString("zh-CN")}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {articleResults.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                ✍️ 文章文案 ({articleResults.length})
              </h2>
              <div className="space-y-3">
                {articleResults.map((a) => {
                  const platformLabel =
                    a.platform === "wechat"
                      ? "💚 公众号"
                      : a.platform === "xiaohongshu"
                      ? "❤️ 小红书"
                      : "📝 其他";
                  return (
                    <Link
                      key={a.id}
                      href={`/articles/${a.id}`}
                      className="block p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all bg-white"
                    >
                      <h3 className="font-medium text-gray-900">{a.title}</h3>
                      <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-500">
                        <span>{platformLabel}</span>
                        <span>
                          {new Date(a.created_at).toLocaleDateString("zh-CN")}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
