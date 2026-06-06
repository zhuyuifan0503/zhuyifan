import Link from "next/link";
import { ConversationCard, ArticleCard } from "@/components/ContentCard";
import type { ConversationSummary, ArticleSummary } from "@/types";

async function getRecentContent() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes("your-project-id")) {
    return { conversations: [], articles: [], configured: false };
  }

  try {
    const { getConversations, getArticles } = await import("@/lib/supabase");
    const [chatResult, articleResult] = await Promise.all([
      getConversations(1, 6),
      getArticles(1, 6),
    ]);

    return {
      conversations: chatResult.conversations,
      articles: articleResult.articles,
      configured: true,
    };
  } catch {
    return { conversations: [], articles: [], configured: false };
  }
}

export default async function HomePage() {
  const { conversations, articles, configured } = await getRecentContent();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          📚 内容仓库
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          一站式保存我的 ChatGPT 对话记录、公众号文章和小红书文案。
          从 AI 对话中沉淀知识，从创作中积累灵感。
        </p>
        {!configured && (
          <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-xl max-w-2xl mx-auto text-left">
            <h2 className="font-semibold text-amber-800 mb-2">⚙️ 尚未配置 Supabase</h2>
            <p className="text-amber-700 text-sm mb-4">
              请先在{" "}
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline font-medium"
              >
                Supabase
              </a>{" "}
              创建项目，然后在 <code className="bg-amber-100 px-1 rounded">.env.local</code> 中填入配置信息。
            </p>
            <ol className="text-amber-700 text-sm list-decimal list-inside space-y-1">
              <li>在 Supabase 创建免费项目</li>
              <li>在 SQL Editor 中运行 <code className="bg-amber-100 px-1 rounded">schema.sql</code></li>
              <li>复制项目 URL 和 API Key 到 <code className="bg-amber-100 px-1 rounded">.env.local</code></li>
              <li>设置 <code className="bg-amber-100 px-1 rounded">ADMIN_PASSWORD</code></li>
            </ol>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        <div className="text-center p-6 bg-white rounded-xl border border-gray-200">
          <div className="text-3xl font-bold text-blue-600">{conversations.length}</div>
          <div className="text-sm text-gray-500 mt-1">ChatGPT 对话</div>
        </div>
        <div className="text-center p-6 bg-white rounded-xl border border-gray-200">
          <div className="text-3xl font-bold text-green-600">{articles.length}</div>
          <div className="text-sm text-gray-500 mt-1">文章 & 文案</div>
        </div>
        <div className="text-center p-6 bg-white rounded-xl border border-gray-200">
          <div className="text-3xl font-bold text-purple-600">
            {conversations.reduce((s, c) => s + (c.message_count || 0), 0)}
          </div>
          <div className="text-sm text-gray-500 mt-1">条消息</div>
        </div>
        <Link
          href="/search"
          className="text-center p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-colors group"
        >
          <div className="text-3xl font-bold text-gray-400 group-hover:text-blue-600">🔍</div>
          <div className="text-sm text-gray-500 mt-1">搜索全部</div>
        </Link>
      </div>

      {/* Recent ChatGPT */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">💬 最近对话</h2>
          {conversations.length > 0 && (
            <Link
              href="/chatgpt"
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              查看全部 →
            </Link>
          )}
        </div>
        {conversations.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {conversations.map((c) => (
              <ConversationCard key={c.id} conversation={c} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-400 text-lg">暂无对话记录</p>
            <p className="text-gray-400 text-sm mt-1">
              前往{" "}
              <Link href="/admin/import" className="text-blue-500 underline">
                管理后台
              </Link>{" "}
              导入
            </p>
          </div>
        )}
      </section>

      {/* Recent Articles */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">✍️ 最近文案</h2>
          {articles.length > 0 && (
            <Link
              href="/articles"
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              查看全部 →
            </Link>
          )}
        </div>
        {articles.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-400 text-lg">暂无文案</p>
            <p className="text-gray-400 text-sm mt-1">
              前往{" "}
              <Link href="/admin/import" className="text-blue-500 underline">
                管理后台
              </Link>{" "}
              添加
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
