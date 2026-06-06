import { notFound } from "next/navigation";
import Link from "next/link";
import { getConversation, getAllTags } from "@/lib/supabase";
import ChatMessageBubble from "@/components/ChatMessage";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes("your-project-id")) {
    return { title: "对话详情 — 内容仓库" };
  }

  try {
    const conversation = await getConversation(id);
    if (!conversation) return { title: "对话未找到" };
    return {
      title: `${conversation.title || "未命名对话"} — ChatGPT 对话`,
      description: `${conversation.message_count} 条消息 · ${conversation.model || "ChatGPT"}`,
    };
  } catch {
    return { title: "对话详情 — 内容仓库" };
  }
}

export default async function ConversationDetailPage({ params }: Props) {
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

  const conversation = await getConversation(id);
  if (!conversation) notFound();

  const date = new Date(conversation.created_at).toLocaleDateString("zh-CN", {
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
          href="/chatgpt"
          className="text-sm text-blue-600 hover:underline"
        >
          ← 返回对话列表
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {conversation.title || "未命名对话"}
        </h1>
        <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-gray-500">
          {conversation.model && (
            <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 font-medium">
              {conversation.model}
            </span>
          )}
          <span>💬 {conversation.message_count} 条消息</span>
          <span>{date}</span>
          <span className="text-xs px-2 py-0.5 rounded bg-gray-100">
            {conversation.source === "import" ? "📥 导入" : "✏️ 手动"}
          </span>
        </div>
        {conversation.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {conversation.tags.map((tag) => (
              <Link
                key={tag}
                href={`/chatgpt?tag=${encodeURIComponent(tag)}`}
                className="text-xs px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
        {conversation.messages.length === 0 ? (
          <div className="p-12 text-center text-gray-400">暂无消息</div>
        ) : (
          conversation.messages
            .filter((m) => m.role !== "system")
            .map((message, i) => (
              <ChatMessageBubble key={i} message={message} index={i} />
            ))
        )}
      </div>

      {/* Bottom nav */}
      <div className="mt-8 text-center">
        <Link
          href="/chatgpt"
          className="text-sm text-blue-600 hover:underline"
        >
          ← 返回对话列表
        </Link>
      </div>
    </div>
  );
}
