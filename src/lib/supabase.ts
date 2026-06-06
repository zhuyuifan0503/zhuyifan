import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Conversation, ConversationSummary, Article, ArticleSummary } from "@/types";

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (_supabase) return _supabase;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("your-project-id")) {
    return null;
  }

  try {
    _supabase = createClient(supabaseUrl, supabaseAnonKey);
    return _supabase;
  } catch {
    return null;
  }
}

// Also export as supabase for backward compatibility (client components)
export const supabase = (() => {
  const client = getSupabase();
  if (!client) {
    // Return a proxy that returns null/empty for all calls
    return new Proxy({} as SupabaseClient, {
      get() {
        return undefined;
      },
    });
  }
  return client;
})();

// Server-side helper functions

export async function getConversations(
  page = 1,
  limit = 20,
  tag?: string
): Promise<{ conversations: ConversationSummary[]; total: number }> {
  const client = getSupabase();
  if (!client) return { conversations: [], total: 0 };

  let query = client
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
  const client = getSupabase();
  if (!client) return null;

  const { data, error } = await client
    .from("conversations")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Conversation;
}

export async function searchConversations(query: string): Promise<ConversationSummary[]> {
  const client = getSupabase();
  if (!client) return [];

  const { data, error } = await client
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
  const client = getSupabase();
  if (!client) return { articles: [], total: 0 };

  let query = client
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
  const client = getSupabase();
  if (!client) return null;

  const { data, error } = await client
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
  const client = getSupabase();
  if (!client) return [];

  let dbQuery = client
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
  const client = getSupabase();
  if (!client) return { chatgpt: [], articles: [] };

  const [chatgptRes, articlesRes] = await Promise.all([
    client.from("conversations").select("tags"),
    client.from("articles").select("tags"),
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
