import Link from "next/link";
import { ArticleCard } from "@/components/ContentCard";
import { getArticles, getAllTags } from "@/lib/supabase";
import Pagination from "@/components/Pagination";

export const metadata = {
  title: "公众号 · 小红书 — 内容仓库",
};

export default async function ArticlesListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; platform?: string; tag?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const platform = params.platform;
  const tag = params.tag;
  const limit = 20;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const configured = supabaseUrl && !supabaseUrl.includes("your-project-id");

  let articles: Awaited<ReturnType<typeof getArticles>> = { articles: [], total: 0 };
  let allTags: string[] = [];

  if (configured) {
    try {
      [articles, { articles: allTags }] = await Promise.all([
        getArticles(page, limit, platform, tag),
        getAllTags(),
      ]);
    } catch {
      // error
    }
  }

  const totalPages = Math.ceil(articles.total / limit);

  const platformFilters = [
    { key: undefined, label: "全部" },
    { key: "wechat", label: "💚 公众号" },
    { key: "xiaohongshu", label: "❤️ 小红书" },
    { key: "other", label: "📝 其他" },
  ] as const;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">✍️ 公众号 · 小红书</h1>
        <p className="text-gray-600 mt-2">共 {articles.total} 篇文案</p>
      </div>

      {/* Platform filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        {platformFilters.map((pf) => {
          const isActive = platform === pf.key || (!platform && !pf.key);
          const href = new URLSearchParams();
          if (pf.key) href.set("platform", pf.key);
          if (tag) href.set("tag", tag);
          const qs = href.toString();
          return (
            <Link
              key={pf.key || "all"}
              href={qs ? `/articles?${qs}` : "/articles"}
              className={`text-sm px-3 py-1.5 rounded-full font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {pf.label}
            </Link>
          );
        })}
      </div>

      {/* Tag filter */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {allTags.map((t) => {
            const href = new URLSearchParams();
            if (platform) href.set("platform", platform);
            href.set("tag", t);
            return (
              <Link
                key={t}
                href={`/articles?${href.toString()}`}
                className={`text-sm px-3 py-1.5 rounded-full font-medium transition-colors ${
                  tag === t
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {t}
              </Link>
            );
          })}
        </div>
      )}

      {/* List */}
      {articles.articles.length > 0 ? (
        <>
          <div className="grid md:grid-cols-2 gap-4">
            {articles.articles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath="/articles"
            queryParams={{
              ...(platform ? { platform } : {}),
              ...(tag ? { tag } : {}),
            }}
          />
        </>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-400 text-lg">
            {configured ? "暂无文案" : "请先配置 Supabase"}
          </p>
        </div>
      )}
    </div>
  );
}
