# 📚 内容仓库

保存 ChatGPT 对话记录、公众号文章和小红书文案的个人知识库网站。

数据存储在本地 JSON 文件中，无需数据库，开箱即用。

## 功能

- **ChatGPT 对话管理** — 支持从 ChatGPT 导出 JSON 文件批量导入，或手动粘贴对话
- **公众号 · 小红书文案** — 管理各平台创作内容，按平台和标签筛选
- **全文搜索** — 一键搜索所有对话和文章
- **管理后台** — 密码保护的管理界面，安全导入内容

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

打开 http://localhost:3000

- 管理后台：http://localhost:3000/admin
- 默认密码：`admin123`（在 `.env.local` 的 `ADMIN_PASSWORD` 中修改）

## 数据存储

所有数据保存在 `data/` 目录下的 JSON 文件中：
- `data/conversations.json` — ChatGPT 对话记录
- `data/articles.json` — 公众号/小红书文案

## 使用指南

### 导入 ChatGPT 对话

**方式一：上传 JSON 文件**
1. 在 ChatGPT 中：设置 → 数据管理 → 导出数据
2. 下载 ZIP 后解压，找到 `conversations.json`
3. 在管理后台（`/admin`）→ 导入内容 → 上传文件

**方式二：手动粘贴**
1. 在管理后台 → 粘贴对话
2. 按格式粘贴对话内容（以 "你：" / "ChatGPT：" 开头）

### 添加文章/文案

在管理后台 → 添加文章，填写标题、内容，选择平台（公众号/小红书/其他）。

## 技术栈

- **前端**: Next.js 16 (App Router) + TypeScript + Tailwind CSS
- **存储**: 本地 JSON 文件

## License

MIT
