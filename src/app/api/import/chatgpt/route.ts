import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { insertConversation } from "@/lib/auth";
import { randomUUID } from "crypto";
import type { ChatMessage } from "@/types";

// ChatGPT export can be an array of conversations or a Record of conversation objects
interface RawConversation {
  title?: string;
  mapping?: Record<string, RawNode>;
  conversation_id?: string;
}

interface RawNode {
  id?: string;
  message?: {
    id?: string;
    author: { role: string; name?: string | null };
    content: { content_type?: string; parts?: string[] };
    create_time?: number;
  };
  parent?: string | null;
  children?: string[];
}

function parseChatGPTExport(raw: unknown): {
  title: string;
  messages: ChatMessage[];
}[] {
  const conversations: { title: string; messages: ChatMessage[] }[] = [];

  // Handle both array and object formats
  const entries: Array<[string, RawConversation]> = [];

  if (Array.isArray(raw)) {
    raw.forEach((item, i) => {
      if (item && typeof item === "object") {
        entries.push([String(i), item as RawConversation]);
      }
    });
  } else if (raw && typeof raw === "object") {
    entries.push(...Object.entries(raw as Record<string, RawConversation>));
  }

  for (const [, conversation] of entries) {
    if (!conversation.mapping) continue;

    const mapping = conversation.mapping;
    const title = conversation.title || "未命名对话";

    // Reconstruct message tree
    const messages: ChatMessage[] = [];
    const mappingValues = Object.values(mapping);
    const rootNode = mappingValues.find((n) => n.parent == null);

    if (rootNode) {
      let currentNode = rootNode;
      while (currentNode) {
        if (currentNode.message) {
          const author = currentNode.message.author;
          const role =
            author.role === "user"
              ? "user"
              : author.role === "assistant"
              ? "assistant"
              : author.role === "system"
              ? "system"
              : "tool";

          let content = "";
          if (currentNode.message.content.content_type === "text") {
            content = (currentNode.message.content.parts || []).join("\n");
          } else if (currentNode.message.content.content_type === "code") {
            content = (currentNode.message.content.parts || []).join("\n");
          } else {
            content = JSON.stringify(currentNode.message.content);
          }

          if (content.trim()) {
            messages.push({
              role,
              content,
              name: author.name ?? undefined,
            });
          }
        }

        // Follow the first child (main conversation thread)
        const children = currentNode.children;
        if (children && children.length > 0) {
          const next = mapping[children[0]];
          if (next) {
            currentNode = next;
          } else {
            break;
          }
        } else {
          break;
        }
      }
    }

    conversations.push({ title, messages });
  }

  return conversations;
}

function parsePastedText(text: string): ChatMessage[] {
  const messages: ChatMessage[] = [];
  const lines = text.split("\n");
  let currentRole: "user" | "assistant" | null = null;
  let currentContent: string[] = [];

  const flushMessage = () => {
    if (currentRole && currentContent.length > 0) {
      messages.push({
        role: currentRole,
        content: currentContent.join("\n").trim(),
      });
    }
    currentContent = [];
  };

  for (const line of lines) {
    // Detect role changes
    const userMatch = line.match(/^(你[：:]|You[:：]|User[:：]|👤|Human[:：])/i);
    const assistantMatch = line.match(/^(ChatGPT[:：]|Assistant[:：]|AI[:：]|🤖|GPT[:：]|Bot[:：])/i);

    if (userMatch) {
      flushMessage();
      currentRole = "user";
      currentContent.push(line.replace(userMatch[0], "").trim());
    } else if (assistantMatch) {
      flushMessage();
      currentRole = "assistant";
      currentContent.push(line.replace(assistantMatch[0], "").trim());
    } else if (currentRole) {
      currentContent.push(line);
    } else {
      // First line without prefix - assume it's user message
      currentRole = "user";
      currentContent.push(line);
    }
  }
  flushMessage();

  return messages;
}

export async function POST(request: Request) {
  try {
    // Auth check
    const cookieStore = await cookies();
    const adminToken = cookieStore.get("admin_token")?.value;
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    if (adminToken !== adminPassword) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      // JSON file upload
      const formData = await request.formData();
      const file = formData.get("json") as Blob | null;
      const tagsStr = (formData.get("tags") as string) || "";

      if (!file) {
        return NextResponse.json({ error: "未上传文件" }, { status: 400 });
      }

      const text = await file.text();
      let data: unknown;

      try {
        data = JSON.parse(text);
      } catch {
        return NextResponse.json({ error: "JSON 解析失败" }, { status: 400 });
      }

      const tags = tagsStr
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const conversations = parseChatGPTExport(data);
      let imported = 0;

      for (const conv of conversations) {
        if (conv.messages.length === 0) continue;

        await insertConversation({
          id: randomUUID(),
          title: conv.title,
          model: "ChatGPT",
          messages: conv.messages,
          tags,
          source: "import",
          message_count: conv.messages.length,
        });
        imported++;
      }

      return NextResponse.json({
        success: true,
        message: `成功导入 ${imported} 条对话（共 ${conversations.length} 条，跳过 ${conversations.length - imported} 条空对话）`,
      });
    } else {
      // Manual paste
      const body = await request.json();
      const { type, title, content, tags } = body;

      if (type !== "paste" || !content) {
        return NextResponse.json({ error: "参数错误" }, { status: 400 });
      }

      const messages = parsePastedText(content);

      if (messages.length === 0) {
        return NextResponse.json({ error: "未能解析出任何消息" }, { status: 400 });
      }

      await insertConversation({
        id: randomUUID(),
        title: title || "手动导入的对话",
        model: "ChatGPT",
        messages,
        tags: tags || [],
        source: "manual",
        message_count: messages.length,
      });

      return NextResponse.json({
        success: true,
        message: `成功保存 1 条对话（${messages.length} 条消息）`,
      });
    }
  } catch (err) {
    console.error("Import error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "导入失败" },
      { status: 500 }
    );
  }
}
