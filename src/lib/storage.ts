import fs from "fs";
import path from "path";
import type { Conversation, ConversationSummary, Article, ArticleSummary } from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJSON<T>(filename: string): T {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "[]", "utf-8");
    return [] as unknown as T;
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

function writeJSON<T>(filename: string, data: T): void {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// === Conversations ===

export async function getConversations(
  page = 1,
  limit = 20,
  tag?: string
): Promise<{ conversations: ConversationSummary[]; total: number }> {
  const all = readJSON<Conversation[]>("conversations.json");
  let filtered = all;

  if (tag) {
    filtered = all.filter((c) => c.tags.includes(tag));
  }

  filtered.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const total = filtered.length;
  const start = (page - 1) * limit;
  const conversations = filtered.slice(start, start + limit).map((c) => ({
    id: c.id,
    title: c.title,
    model: c.model,
    tags: c.tags,
    message_count: c.message_count,
    created_at: c.created_at,
  }));

  return { conversations, total };
}

export async function getConversation(id: string): Promise<Conversation | null> {
  const all = readJSON<Conversation[]>("conversations.json");
  return all.find((c) => c.id === id) || null;
}

export async function searchConversations(query: string): Promise<ConversationSummary[]> {
  const all = readJSON<Conversation[]>("conversations.json");
  const q = query.toLowerCase();
  return all
    .filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.messages.some((m) => m.content.toLowerCase().includes(q))
    )
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 20)
    .map((c) => ({
      id: c.id,
      title: c.title,
      model: c.model,
      tags: c.tags,
      message_count: c.message_count,
      created_at: c.created_at,
    }));
}

// === Articles ===

export async function getArticles(
  page = 1,
  limit = 20,
  platform?: string,
  tag?: string
): Promise<{ articles: ArticleSummary[]; total: number }> {
  const all = readJSON<Article[]>("articles.json");
  let filtered = all;

  if (platform && platform !== "all") {
    filtered = filtered.filter((a) => a.platform === platform);
  }
  if (tag) {
    filtered = filtered.filter((a) => a.tags.includes(tag));
  }

  filtered.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const total = filtered.length;
  const start = (page - 1) * limit;
  const articles = filtered.slice(start, start + limit).map((a) => ({
    id: a.id,
    title: a.title,
    platform: a.platform,
    tags: a.tags,
    cover_image: a.cover_image,
    created_at: a.created_at,
  }));

  return { articles, total };
}

export async function getArticle(id: string): Promise<Article | null> {
  const all = readJSON<Article[]>("articles.json");
  return all.find((a) => a.id === id) || null;
}

export async function searchArticles(
  query: string,
  platform?: string
): Promise<ArticleSummary[]> {
  const all = readJSON<Article[]>("articles.json");
  const q = query.toLowerCase();
  let filtered = all.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.content.toLowerCase().includes(q)
  );

  if (platform && platform !== "all") {
    filtered = filtered.filter((a) => a.platform === platform);
  }

  return filtered
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 20)
    .map((a) => ({
      id: a.id,
      title: a.title,
      platform: a.platform,
      tags: a.tags,
      cover_image: a.cover_image,
      created_at: a.created_at,
    }));
}

// === Tags ===

export async function getAllTags(): Promise<{
  chatgpt: string[];
  articles: string[];
}> {
  const conversations = readJSON<Conversation[]>("conversations.json");
  const articles = readJSON<Article[]>("articles.json");

  const chatgptTags = new Set<string>();
  const articleTags = new Set<string>();

  conversations.forEach((c) => c.tags.forEach((t) => chatgptTags.add(t)));
  articles.forEach((a) => a.tags.forEach((t) => articleTags.add(t)));

  return {
    chatgpt: Array.from(chatgptTags).sort(),
    articles: Array.from(articleTags).sort(),
  };
}

// === Mutations ===

export async function insertConversation(
  conversation: Omit<Conversation, "created_at" | "updated_at"> & Partial<Pick<Conversation, "created_at" | "updated_at">>
): Promise<void> {
  const now = new Date().toISOString();
  const all = readJSON<Conversation[]>("conversations.json");
  all.push({
    ...conversation,
    created_at: conversation.created_at || now,
    updated_at: conversation.updated_at || now,
  } as Conversation);
  writeJSON("conversations.json", all);
}

export async function insertArticle(
  article: Omit<Article, "created_at" | "updated_at"> & Partial<Pick<Article, "created_at" | "updated_at">>
): Promise<void> {
  const now = new Date().toISOString();
  const all = readJSON<Article[]>("articles.json");
  all.push({
    ...article,
    created_at: article.created_at || now,
    updated_at: article.updated_at || now,
  } as Article);
  writeJSON("articles.json", all);
}

export async function deleteConversation(id: string): Promise<void> {
  const all = readJSON<Conversation[]>("conversations.json");
  writeJSON(
    "conversations.json",
    all.filter((c) => c.id !== id)
  );
}

export async function deleteArticle(id: string): Promise<void> {
  const all = readJSON<Article[]>("articles.json");
  writeJSON(
    "articles.json",
    all.filter((a) => a.id !== id)
  );
}
