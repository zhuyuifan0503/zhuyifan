# 📚 内容仓库

保存 ChatGPT 对话记录、公众号文章和小红书文案的个人知识库网站。

## 功能

- **ChatGPT 对话管理** — 支持从 ChatGPT 导出 JSON 文件批量导入，或手动粘贴对话
- **公众号 · 小红书文案** — 管理各平台创作内容，按平台和标签筛选
- **全文搜索** — 一键搜索所有对话和文章
- **公开浏览** — 内容公开展示，作为个人博客/知识库
- **管理后台** — 密码保护的管理界面，安全导入内容

## 技术栈

- **前端**: Next.js 16 (App Router) + TypeScript + Tailwind CSS
- **数据库**: Supabase (PostgreSQL)，免费 500MB
- **部署**: Vercel (免费)

## 快速开始

### 1. 创建 Supabase 项目

1. 前往 [Supabase](https://supabase.com) 注册并创建新项目
2. 在项目的 **SQL Editor** 中执行 `schema.sql` 文件中的所有 SQL
3. 在 **Settings → API** 中复制:
   - `Project URL` → 填入 `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → 填入 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → 填入 `SUPABASE_SERVICE_ROLE_KEY`

### 2. 配置环境变量

```bash
cp .env.example .env.local
# 编辑 .env.local 填入你的 Supabase 配置和管理员密码
```

### 3. 本地运行

```bash
npm install
npm run dev
```

打开 http://localhost:3000

### 4. 部署到 Vercel

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 在 Vercel 项目设置中添加 `.env.local` 中的所有环境变量
4. 部署

## 使用指南

### 导入 ChatGPT 对话

**方式一：上传 JSON 文件**

1. 在 ChatGPT 中：设置 → 数据管理 → 导出数据
2. 下载 ZIP 后解压，找到 `conversations.json`
3. 在管理后台（`/admin`）→ 导入内容 → 上传文件

**方式二：手动粘贴**

1. 在管理后台 → 粘贴对话
2. 按格式粘贴对话内容（以 "你：" / "ChatGPT：" 开头），系统自动解析角色

### 添加文章/文案

在管理后台 → 添加文章，填写标题、内容，选择平台（公众号/小红书/其他）。

### 管理后台

访问 `/admin`，使用 `ADMIN_PASSWORD`（环境变量中设置）登录。

## 项目结构

```
content-hub/
├── schema.sql              # 数据库建表 SQL
├── src/
│   ├── app/
│   │   ├── page.tsx        # 首页
│   │   ├── chatgpt/        # ChatGPT 对话列表 & 详情
│   │   ├── articles/       # 文章列表 & 详情
│   │   ├── search/         # 搜索页
│   │   ├── admin/          # 管理后台
│   │   └── api/            # API 路由
│   ├── components/         # React 组件
│   ├── lib/                # 工具库 (Supabase, Auth)
│   └── types/              # TypeScript 类型定义
└── .env.local              # 环境变量 (不提交到 Git)
```

## License

MIT
