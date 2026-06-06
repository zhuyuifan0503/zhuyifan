import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { insertArticle } from "@/lib/auth";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  try {
    // Auth check
    const cookieStore = await cookies();
    const adminToken = cookieStore.get("admin_token")?.value;
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    if (adminToken !== adminPassword) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, platform, tags, cover_image, source_url } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "标题和内容不能为空" }, { status: 400 });
    }

    if (!["wechat", "xiaohongshu", "other"].includes(platform)) {
      return NextResponse.json({ error: "无效的平台类型" }, { status: 400 });
    }

    await insertArticle({
      id: randomUUID(),
      title,
      content,
      platform,
      tags: tags || [],
      cover_image: cover_image || undefined,
      source_url: source_url || undefined,
    });

    return NextResponse.json({ success: true, message: "文章保存成功" });
  } catch (err) {
    console.error("Article create error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "保存失败" },
      { status: 500 }
    );
  }
}
