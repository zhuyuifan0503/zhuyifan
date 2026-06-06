import Link from "next/link";
import { ConversationCard } from "@/components/ContentCard";
import { getConversations, getAllTags } from "@/lib/supabase";
import Pagination from "@/components/Pagination";

export const metadata = {
  title: "ChatGPT 对话 — 内容仓库",
};

export default async function ChatGPTListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tag?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const tag = params.tag;
  const limit = 20;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const configured = supabaseUrl && !supabaseUrl.includes("your-project-id");

  let conversations: Awaited<ReturnType<typeof getConversations>> = {
    conversations: [],
    total: 0,
  };
  let allTags: string[] = [];

  if (configured) {
    try {
      [conversations, { chatgpt: allTags }] = await Promise.all([
        getConversations(page, limit, tag),
        getAllTags(),
      ]);
    } catch {
      // Supabase not configured or error
    }
  }

  const totalPages = Math.ceil(conversations.total / limit);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">💬 ChatGPT 对话</h1>
        <p className="text-gray-600 mt-2">
          共 {conversations.total} 条对话记录
        </p>
      </div>

      {/* Tag filter */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <Link
            href="/chatgpt"
            className={`text-sm px-3 py-1.5 rounded-full font-medium transition-colors ${
              !tag
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            全部
          </Link>
          {allTags.map((t) => (
            <Link
              key={t}
              href={`/chatgpt?tag=${encodeURIComponent(t)}`}
              className={`text-sm px-3 py-1.5 rounded-full font-medium transition-colors ${
                tag === t
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t}
            </Link>
          ))}
        </div>
      )}

      {/* List */}
      {conversations.conversations.length > 0 ? (
        <>
          <div className="grid md:grid-cols-2 gap-4">
            {conversations.conversations.map((c) => (
              <ConversationCard key={c.id} conversation={c} />
            ))}
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath="/chatgpt"
            queryParams={tag ? { tag } : undefined}
          />
        </>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-400 text-lg">
            {configured ? "暂无对话记录" : "请先配置 Supabase"}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {configured ? (
              <>
                前往{" "}
                <Link href="/admin/import" className="text-blue-500 underline">
                  管理后台
                </Link>{" "}
                导入数据
              </>
            ) : (
              "查看项目 README 了解配置步骤"
            )}
          </p>
        </div>
      )}
    </div>
  );
}
