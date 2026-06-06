"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Tab = "chatgpt-json" | "chatgpt-paste" | "article";

interface Props {
  activeTab: string;
}

export default function ImportForm({ activeTab: initialTab }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(
    (initialTab === "article" ? "article" : "chatgpt-json") as Tab
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // === ChatGPT JSON Upload ===
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [jsonTags, setJsonTags] = useState("");

  // === ChatGPT Manual Paste ===
  const [pasteTitle, setPasteTitle] = useState("");
  const [pasteContent, setPasteContent] = useState("");
  const [pasteTags, setPasteTags] = useState("");

  // === Article ===
  const [articleTitle, setArticleTitle] = useState("");
  const [articleContent, setArticleContent] = useState("");
  const [articlePlatform, setArticlePlatform] = useState<"wechat" | "xiaohongshu" | "other">("wechat");
  const [articleTags, setArticleTags] = useState("");
  const [articleCover, setArticleCover] = useState("");
  const [articleUrl, setArticleUrl] = useState("");

  const resetResult = useCallback(() => setResult(null), []);

  const handleJsonUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jsonFile) return;

    setLoading(true);
    setResult(null);

    try {
      const text = await jsonFile.text();
      const data = JSON.parse(text);

      const formData = new FormData();
      formData.append("json", new Blob([JSON.stringify(data)], { type: "application/json" }));
      formData.append("tags", jsonTags);

      const res = await fetch("/api/import/chatgpt", {
        method: "POST",
        body: formData,
      });

      const body = await res.json();
      if (res.ok) {
        setResult({ success: true, message: body.message || "导入成功" });
        setJsonFile(null);
        setJsonTags("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        router.refresh();
      } else {
        setResult({ success: false, message: body.error || "导入失败" });
      }
    } catch (err) {
      setResult({
        success: false,
        message: err instanceof Error ? err.message : "文件解析失败，请检查 JSON 格式",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteContent.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/import/chatgpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "paste",
          title: pasteTitle.trim() || `手动导入 - ${new Date().toLocaleDateString("zh-CN")}`,
          content: pasteContent,
          tags: pasteTags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });

      const body = await res.json();
      if (res.ok) {
        setResult({ success: true, message: body.message || "保存成功" });
        setPasteTitle("");
        setPasteContent("");
        setPasteTags("");
        router.refresh();
      } else {
        setResult({ success: false, message: body.error || "保存失败" });
      }
    } catch {
      setResult({ success: false, message: "请求失败，请重试" });
    } finally {
      setLoading(false);
    }
  };

  const handleArticleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleTitle.trim() || !articleContent.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: articleTitle.trim(),
          content: articleContent.trim(),
          platform: articlePlatform,
          tags: articleTags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          cover_image: articleCover.trim() || undefined,
          source_url: articleUrl.trim() || undefined,
        }),
      });

      const body = await res.json();
      if (res.ok) {
        setResult({ success: true, message: "文章保存成功！" });
        setArticleTitle("");
        setArticleContent("");
        setArticleTags("");
        setArticleCover("");
        setArticleUrl("");
        router.refresh();
      } else {
        setResult({ success: false, message: body.error || "保存失败" });
      }
    } catch {
      setResult({ success: false, message: "请求失败，请重试" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-gray-100 rounded-lg p-1 w-fit">
        {[
          { key: "chatgpt-json" as Tab, label: "📂 上传 ChatGPT JSON" },
          { key: "chatgpt-paste" as Tab, label: "📋 粘贴对话" },
          { key: "article" as Tab, label: "✍️ 添加文章/文案" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setTab(t.key);
              resetResult();
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Result message */}
      {result && (
        <div
          className={`mb-6 p-4 rounded-lg border ${
            result.success
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {result.message}
        </div>
      )}

      {/* JSON Upload Form */}
      {tab === "chatgpt-json" && (
        <form onSubmit={handleJsonUpload} className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              上传 ChatGPT 导出文件
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              在 ChatGPT 设置 → 数据管理 → 导出数据，下载 ZIP 后解压，选择其中的{" "}
              <code className="bg-gray-100 px-1 rounded">conversations.json</code> 文件上传。
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                JSON 文件
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={(e) => setJsonFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                标签（用逗号分隔，可选）
              </label>
              <input
                type="text"
                value={jsonTags}
                onChange={(e) => setJsonTags(e.target.value)}
                placeholder="例如: AI, Python, 编程技巧"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !jsonFile}
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "导入中..." : "开始导入"}
            </button>
          </div>
        </form>
      )}

      {/* Paste Form */}
      {tab === "chatgpt-paste" && (
        <form onSubmit={handlePasteSubmit} className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">粘贴对话内容</h3>
            <p className="text-sm text-gray-500 mb-4">
              粘贴 ChatGPT 对话文本。格式：每行一条消息，以 &quot;你：&quot; 或 &quot;ChatGPT：&quot; 开头分行。
              系统会自动解析。
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                对话标题
              </label>
              <input
                type="text"
                value={pasteTitle}
                onChange={(e) => setPasteTitle(e.target.value)}
                placeholder="给这段对话起个名字"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                对话内容
              </label>
              <textarea
                value={pasteContent}
                onChange={(e) => setPasteContent(e.target.value)}
                placeholder={`你：帮我写一段 Python 代码\n\nChatGPT：好的，以下是...`}
                rows={15}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm font-mono"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                标签（用逗号分隔，可选）
              </label>
              <input
                type="text"
                value={pasteTags}
                onChange={(e) => setPasteTags(e.target.value)}
                placeholder="例如: AI, Python"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !pasteContent.trim()}
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "保存中..." : "保存对话"}
            </button>
          </div>
        </form>
      )}

      {/* Article Form */}
      {tab === "article" && (
        <form onSubmit={handleArticleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">添加文章或文案</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                标题 *
              </label>
              <input
                type="text"
                value={articleTitle}
                onChange={(e) => setArticleTitle(e.target.value)}
                placeholder="文章标题"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                平台 *
              </label>
              <select
                value={articlePlatform}
                onChange={(e) => setArticlePlatform(e.target.value as typeof articlePlatform)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
              >
                <option value="wechat">💚 公众号</option>
                <option value="xiaohongshu">❤️ 小红书</option>
                <option value="other">📝 其他</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                内容 *
              </label>
              <textarea
                value={articleContent}
                onChange={(e) => setArticleContent(e.target.value)}
                placeholder="粘贴文章正文内容..."
                rows={12}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  封面图 URL（可选）
                </label>
                <input
                  type="url"
                  value={articleCover}
                  onChange={(e) => setArticleCover(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  原文链接（可选）
                </label>
                <input
                  type="url"
                  value={articleUrl}
                  onChange={(e) => setArticleUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                标签（用逗号分隔，可选）
              </label>
              <input
                type="text"
                value={articleTags}
                onChange={(e) => setArticleTags(e.target.value)}
                placeholder="例如: 产品经理, 职场感悟, 读书笔记"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !articleTitle.trim() || !articleContent.trim()}
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "保存中..." : "保存文章"}
            </button>
          </div>
        </form>
      )}

      {/* Help text */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>提示：</strong>{" "}
          导入的内容会立即在网站上公开展示。你可以在{" "}
          <Link href="/chatgpt" className="underline">
            ChatGPT 对话
          </Link>{" "}
          和{" "}
          <Link href="/articles" className="underline">
            文章列表
          </Link>{" "}
          中浏览。
        </p>
      </div>
    </div>
  );
}
