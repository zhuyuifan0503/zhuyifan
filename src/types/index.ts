// === Conversation (ChatGPT) Types ===

export interface ChatMessage {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  name?: string;
}

export interface Conversation {
  id: string;
  title: string;
  model?: string;
  messages: ChatMessage[];
  tags: string[];
  source: "manual" | "import";
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface ConversationSummary {
  id: string;
  title: string;
  model?: string;
  tags: string[];
  message_count: number;
  created_at: string;
}

// === Article Types ===

export type ArticlePlatform = "wechat" | "xiaohongshu" | "other";

export interface Article {
  id: string;
  title: string;
  content: string;
  platform: ArticlePlatform;
  tags: string[];
  cover_image?: string;
  source_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ArticleSummary {
  id: string;
  title: string;
  platform: ArticlePlatform;
  tags: string[];
  cover_image?: string;
  created_at: string;
}

// === Search Types ===

export type SearchResultType = "chatgpt" | "article";

export interface SearchResult {
  type: SearchResultType;
  id: string;
  title: string;
  snippet: string;
  created_at: string;
}

// === Import Types ===

export interface ChatGPTExport {
  title: string;
  create_time: number;
  update_time: number;
  mapping: Record<string, ChatGPTExportNode>;
  conversation_id: string;
}

export interface ChatGPTExportNode {
  id: string;
  message?: {
    id: string;
    author: { role: string; name?: string };
    content: { content_type: string; parts?: string[] };
    create_time?: number;
  };
  parent?: string;
  children: string[];
}
