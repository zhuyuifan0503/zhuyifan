-- 在 Supabase SQL Editor 中执行此文件来创建表

-- ChatGPT 对话记录表
CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  model TEXT,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT '{}',
  source TEXT NOT NULL DEFAULT 'manual',
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 公众号/小红书文案表
CREATE TABLE articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  platform TEXT NOT NULL CHECK (platform IN ('wechat', 'xiaohongshu', 'other')),
  tags TEXT[] DEFAULT '{}',
  cover_image TEXT,
  source_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_conversations_created_at ON conversations (created_at DESC);
CREATE INDEX idx_conversations_tags ON conversations USING GIN (tags);
CREATE INDEX idx_conversations_title ON conversations USING GIN (to_tsvector('simple', title));

CREATE INDEX idx_articles_created_at ON articles (created_at DESC);
CREATE INDEX idx_articles_platform ON articles (platform);
CREATE INDEX idx_articles_tags ON articles USING GIN (tags);
CREATE INDEX idx_articles_title ON articles USING GIN (to_tsvector('simple', title));

-- 全文搜索函数
CREATE OR REPLACE FUNCTION search_content(search_query TEXT)
RETURNS TABLE(
  id TEXT,
  title TEXT,
  snippet TEXT,
  result_type TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  -- 搜索对话
  SELECT
    c.id,
    c.title,
    COALESCE(
      (SELECT m.content
       FROM jsonb_array_elements(c.messages) AS m
       WHERE m->>'content' ILIKE '%' || search_query || '%'
       LIMIT 1),
      c.title
    ) AS snippet,
    'chatgpt'::TEXT AS result_type,
    c.created_at
  FROM conversations c
  WHERE c.title ILIKE '%' || search_query || '%'
     OR c.messages::TEXT ILIKE '%' || search_query || '%'

  UNION ALL

  -- 搜索文章
  SELECT
    a.id,
    a.title,
    substring(a.content, 1, 200) AS snippet,
    'article'::TEXT AS result_type,
    a.created_at
  FROM articles a
  WHERE a.title ILIKE '%' || search_query || '%'
     OR a.content ILIKE '%' || search_query || '%'

  ORDER BY created_at DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- 更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 启用 RLS（Row Level Security）- 公开读取，仅管理员写入
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- 公开读取策略
CREATE POLICY "Public read conversations" ON conversations FOR SELECT USING (true);
CREATE POLICY "Public read articles" ON articles FOR SELECT USING (true);

-- 管理员写入策略（使用 service_role key 绕过 RLS）
CREATE POLICY "Admin insert conversations" ON conversations FOR INSERT
  WITH CHECK (true);
CREATE POLICY "Admin delete conversations" ON conversations FOR DELETE
  USING (true);

CREATE POLICY "Admin insert articles" ON articles FOR INSERT
  WITH CHECK (true);
CREATE POLICY "Admin delete articles" ON articles FOR DELETE
  USING (true);
