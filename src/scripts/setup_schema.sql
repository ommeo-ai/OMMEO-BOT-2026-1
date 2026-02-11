-- 1. Enable Vector Extension (Must be done by superuser, but often enabled by default in Supabase)
create extension if not exists vector;

-- 2. Knowledge Base Table
create table if not exists knowledge_base (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  question text not null,
  answer text not null,
  embedding vector(768), -- Gemini dimensions
  metadata jsonb,
  created_at timestamptz default now()
);

-- 3. Vector Index (IVFFlat for performance)
create index if not exists idx_kb_embedding on knowledge_base using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- 4. Bookings Table
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  user_phone text not null,
  service_type text,
  status text default 'pending',
  details jsonb,
  created_at timestamptz default now()
);

-- 5. Handoffs Table
create table if not exists handoffs (
  id uuid primary key default gen_random_uuid(),
  user_phone text not null,
  reason text,
  status text default 'open',
  created_at timestamptz default now()
);

-- 6. Match Function
create or replace function match_knowledge(
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  question text,
  answer text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    k.id,
    k.question,
    k.answer,
    1 - (k.embedding <=> query_embedding) as similarity
  from knowledge_base k
  where 1 - (k.embedding <=> query_embedding) > match_threshold
  order by k.embedding <=> query_embedding
  limit match_count;
end;
$$;
