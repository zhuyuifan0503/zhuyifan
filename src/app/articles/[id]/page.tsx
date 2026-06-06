import { notFound } from "next/navigation";
import Link from "next/link";
import { getArticle } from "@/lib/supabase";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

const platformInfo: Record<string, { emoji: string; label: string; color: string }> = {
  wechat: { emoji: "💚", label: "公众号", color: "bg-green-50 text-green-700" },
  xiaohongshu: { emoji: "❤️", label: "小红书", color: "bg-red-50 text-red-700" },
  other: { emoji: "📝", label: "其他", color: "bg-gray-50 text-gray-700" },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes("your-project-id")) {
    return { title: "文章详情 — 内容仓库" };
  }

  try {
    const article = await getArticle(id);
    if (!article) return { title: "文章未找到" };
    const p = platformInfo[article.platform] || platformInfo.other;
    return {
      title: `${article.title} — ${p.label}`,
      description: article.content.slice(0, 200),
    };
  } catch {
    return { title: "文章详情 — 内容仓库" };
  }
}

export default async function ArticleDetailPage({ params }: Props) {
  const { id } = await params;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const configured = supabaseUrl && !supabaseUrl.includes("your-project-id");

  if (!configured) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-400 text-lg">请先配置 Supabase</p>
      </div>
    );
  }

  const article = await getArticle(id);
  if (!article) notFound();

  const p = platformInfo[article.platform] || platformInfo.other;
  const date = new Date(article.created_at).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/articles"
          className="text-sm text-blue-600 hover:underline"
        >
          ← 返回文章列表
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.color}`}
          >
            {p.emoji} {p.label}
          </span>
          <span className="text-sm text-gray-400">{date}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          {article.title}
        </h1>
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {article.tags.map((tag) => (
              <Link
                key={tag}
                href={`/articles?tag=${encodeURIComponent(tag)}`}
                className="text-xs px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}
        {article.source_url && (
          <a
            href={article.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 text-sm text-blue-600 hover:underline"
          >
            🔗 查看原文
          </a>
        )}
      </div>

      {/* Content */}
      <article className="bg-white rounded-xl border border-gray-200 p-6 md:p-10">
        {article.cover_image && (
          <img
            src={article.cover_image}
            alt={article.title}
            className="w-full max-h-96 object-cover rounded-lg mb-8"
          />
        )}
        <div className="prose prose-gray max-w-none whitespace-pre-wrap break-words">
          {article.content}
        </div>
      </article>

      {/* Bottom nav */}
      <div className="mt-8 text-center">
        <Link
          href="/articles"
          className="text-sm text-blue-600 hover:underline"
        >
          ← 返回文章列表
        </Link>
      </div>
    </div>
  );
}
