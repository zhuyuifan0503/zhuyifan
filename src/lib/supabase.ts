import { createClient } from "@supabase/supabase-js";
import type { Conversation, ConversationSummary, Article, ArticleSummary } from "@/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Public client (for client components)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side helper functions

export async function getConversations(
  page = 1,
  limit = 20,
  tag?: string
): Promise<{ conversations: ConversationSummary[]; total: number }> {
  let query = supabase
    .from("conversations")
    .select("id, title, model, tags, message_count, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (tag) {
    query = query.contains("tags", [tag]);
  }

  const { data, error, count } = await query;
  if (error) throw new Error(`Failed to fetch conversations: ${error.message}`);
  return {
    conversations: (data as ConversationSummary[]) || [],
    total: count || 0,
  };
}

export async function getConversation(id: string): Promise<Conversation | null> {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Conversation;
}

export async function searchConversations(query: string): Promise<ConversationSummary[]> {
  const { data, error } = await supabase
    .from("conversations")
    .select("id, title, model, tags, message_count, created_at")
    .or(`title.ilike.%${query}%`)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return [];
  return (data as ConversationSummary[]) || [];
}

export async function getArticles(
  page = 1,
  limit = 20,
  platform?: string,
  tag?: string
): Promise<{ articles: ArticleSummary[]; total: number }> {
  let query = supabase
    .from("articles")
    .select("id, title, platform, tags, cover_image, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (platform && platform !== "all") {
    query = query.eq("platform", platform);
  }
  if (tag) {
    query = query.contains("tags", [tag]);
  }

  const { data, error, count } = await query;
  if (error) throw new Error(`Failed to fetch articles: ${error.message}`);
  return {
    articles: (data as ArticleSummary[]) || [],
    total: count || 0,
  };
}

export async function getArticle(id: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Article;
}

export async function searchArticles(
  query: string,
  platform?: string
): Promise<ArticleSummary[]> {
  let dbQuery = supabase
    .from("articles")
    .select("id, title, platform, tags, cover_image, created_at")
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .order("created_at", { ascending: false })
    .limit(20);

  if (platform && platform !== "all") {
    dbQuery = dbQuery.eq("platform", platform);
  }

  const { data, error } = await dbQuery;
  if (error) return [];
  return (data as ArticleSummary[]) || [];
}

export async function getAllTags(): Promise<{
  chatgpt: string[];
  articles: string[];
}> {
  const [chatgptRes, articlesRes] = await Promise.all([
    supabase.from("conversations").select("tags"),
    supabase.from("articles").select("tags"),
  ]);

  const chatgptTags = new Set<string>();
  const articleTags = new Set<string>();

  (chatgptRes.data || []).forEach((c: { tags: string[] }) =>
    c.tags?.forEach((t) => chatgptTags.add(t))
  );
  (articlesRes.data || []).forEach((a: { tags: string[] }) =>
    a.tags?.forEach((t) => articleTags.add(t))
  );

  return {
    chatgpt: Array.from(chatgptTags).sort(),
    articles: Array.from(articleTags).sort(),
  };
}
