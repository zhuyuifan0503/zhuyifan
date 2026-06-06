import Link from "next/link";
import type { ConversationSummary, ArticleSummary } from "@/types";

interface ConversationCardProps {
  conversation: ConversationSummary;
}

export function ConversationCard({ conversation }: ConversationCardProps) {
  const date = new Date(conversation.created_at).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Link
      href={`/chatgpt/${conversation.id}`}
      className="block p-5 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all bg-white"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">
          {conversation.title || "未命名对话"}
        </h3>
        {conversation.model && (
          <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 font-medium">
            {conversation.model}
          </span>
        )}
      </div>
      <div className="mt-3 flex items-center gap-3 text-sm text-gray-500">
        <span>💬 {conversation.message_count} 条消息</span>
        <span>{date}</span>
      </div>
      {conversation.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {conversation.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}

interface ArticleCardProps {
  article: ArticleSummary;
}

const platformLabels: Record<string, { emoji: string; label: string; color: string }> = {
  wechat: { emoji: "💚", label: "公众号", color: "bg-green-50 text-green-700" },
  xiaohongshu: { emoji: "❤️", label: "小红书", color: "bg-red-50 text-red-700" },
  other: { emoji: "📝", label: "其他", color: "bg-gray-50 text-gray-700" },
};

export function ArticleCard({ article }: ArticleCardProps) {
  const platform = platformLabels[article.platform] || platformLabels.other;
  const date = new Date(article.created_at).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Link
      href={`/articles/${article.id}`}
      className="block p-5 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all bg-white"
    >
      {article.cover_image && (
        <img
          src={article.cover_image}
          alt={article.title}
          className="w-full h-40 object-cover rounded-lg mb-4"
        />
      )}
      <h3 className="font-semibold text-gray-900 line-clamp-2">{article.title}</h3>
      <div className="mt-3 flex items-center gap-3 text-sm text-gray-500">
        <span className={`text-xs px-2 py-0.5 rounded-full ${platform.color} font-medium`}>
          {platform.emoji} {platform.label}
        </span>
        <span>{date}</span>
      </div>
      {article.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
