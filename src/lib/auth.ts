import { cookies } from "next/headers";
import { insertConversation as storageInsertConv, insertArticle as storageInsertArt, deleteConversation as storageDeleteConv, deleteArticle as storageDeleteArt } from "./storage";

function getEnv() {
  return {
    adminPassword: process.env.ADMIN_PASSWORD || "admin123",
  };
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

// Re-export storage functions for API routes
export { storageInsertConv as insertConversation };
export { storageInsertArt as insertArticle };
export { storageDeleteConv as deleteConversation };
export { storageDeleteArt as deleteArticle };
