import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

function getEnv() {
  return {
    adminPassword: process.env.ADMIN_PASSWORD || "admin123",
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  };
}

export function getServiceClient() {
  const { supabaseUrl, supabaseServiceKey } = getEnv();
  if (!supabaseServiceKey || !supabaseUrl) {
    throw new Error("Supabase service role key or URL is not set");
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  const { adminPassword } = getEnv();
  return token === adminPassword;
}

export async function login(password: string): Promise<boolean> {
  const { adminPassword } = getEnv();
  return password === adminPassword;
}

export function getAuthTokenCookie(password: string): string {
  return `admin_token=${password}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`;
}

export function getLogoutCookie(): string {
  return `admin_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

// Service-role functions for admin operations (bypass RLS)
export async function insertConversation(
  conversation: {
    id: string;
    title: string;
    model?: string;
    messages: unknown;
    tags: string[];
    source: string;
    message_count: number;
  }
) {
  const client = getServiceClient();
  const { error } = await client.from("conversations").insert(conversation);
  if (error) throw new Error(`Failed to insert conversation: ${error.message}`);
}

export async function insertArticle(
  article: {
    id: string;
    title: string;
    content: string;
    platform: string;
    tags: string[];
    cover_image?: string;
    source_url?: string;
  }
) {
  const client = getServiceClient();
  const { error } = await client.from("articles").insert(article);
  if (error) throw new Error(`Failed to insert article: ${error.message}`);
}

export async function deleteConversation(id: string) {
  const client = getServiceClient();
  const { error } = await client.from("conversations").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete conversation: ${error.message}`);
}

export async function deleteArticle(id: string) {
  const client = getServiceClient();
  const { error } = await client.from("articles").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete article: ${error.message}`);
}
