"use client";

import { useState } from "react";
import type { ChatMessage as ChatMessageType } from "@/types";

interface Props {
  message: ChatMessageType;
  index: number;
}

export default function ChatMessageBubble({ message, index }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  if (isSystem) return null;

  const contentLength = message.content?.length || 0;
  const isLong = contentLength > 2000;

  return (
    <div
      className={`flex gap-3 px-4 py-3 ${
        isUser ? "bg-gray-50" : "bg-white"
      }`}
    >
      {/* Avatar */}
      <div
        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
          isUser
            ? "bg-blue-500 text-white"
            : "bg-green-500 text-white"
        }`}
      >
        {isUser ? "👤" : "🤖"}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-gray-500 mb-1">
          {isUser ? "你" : `ChatGPT${message.name ? ` (${message.name})` : ""}`}
          <span className="ml-2 text-gray-400 font-normal">
            #{index + 1}
          </span>
          {isLong && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="ml-2 text-blue-500 hover:underline"
            >
              {collapsed ? "展开" : "收起"}
            </button>
          )}
        </div>
        <div
          className={`prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap break-words ${
            collapsed ? "max-h-48 overflow-hidden" : ""
          }`}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}
