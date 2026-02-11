require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupSchema() {
  console.log("🚀 Starting Schema Setup...");

  // SQL Statements
  const sqlStatements = [
    // 1. Enable Vector Extension
    `create extension if not exists vector;`,

    // 2. Create Knowledge Base Table
    `create table if not exists knowledge_base (
      id float8 primary key default generate_uid(16), 
      category text not null,
      question text not null,
      answer text not null,
      embedding vector(768),
      metadata jsonb,
      created_at timestamptz default now()
    );`,
    
    // Note: 'generate_uid' is hypothetical here if not installed. 
    // Usually UUID is safer default: id uuid primary key default gen_random_uuid()
    // Let's switch to UUID for broader compatibility without custom functions.
    
    `create table if not exists knowledge_base (
      id uuid primary key default gen_random_uuid(),
      category text not null,
      question text not null,
      answer text not null,
      embedding vector(768),
      metadata jsonb,
      created_at timestamptz default now()
    );`,

    // 3. Create Index for Vector Search
    `create index if not exists idx_kb_embedding on knowledge_base using ivfflat (embedding vector_cosine_ops) with (lists = 100);`,

    // 4. Create Bookings Table (if not exists)
    `create table if not exists bookings (
      id uuid primary key default gen_random_uuid(),
      user_phone text not null,
      service_type text,
      status text default 'pending',
      details jsonb,
      created_at timestamptz default now()
    );`,

     // 5. Create Handoffs Table
    `create table if not exists handoffs (
      id uuid primary key default gen_random_uuid(),
      user_phone text not null,
      reason text,
      status text default 'open',
      created_at timestamptz default now()
    );`,
    
    // 6. Create MATCH FUNCTION (Critical for RAG)
    `create or replace function match_knowledge(
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
    $$;`
  ];

  // Since supbase-js doesn't support raw SQL on the client directly without RPC or special rights often,
  // we usually use the SQL Editor. HOWEVER, we have the SERVICE ROLE KEY.
  // There is no direct "sql" method in the JS client.
  // Workaround: We will use the REST API '/v1/query' endpoint if enabled, OR mostly reliable RPCs.
  // BUT... we can't create tables via standard JS client methods usually.
  
  // STRATEGY CHANGE: 
  // We cannot run DDL (CREATE TABLE) via the supabase-js client unless we wrap it in a postgres function via RPC, 
  // which requires the function to exist first.
  // OR we use the direct Postgres connection string to run migrations.
  
  // Checking .env for DB connection string? Usually it is NOT exposed in standard Supabase generic .env unless added.
  // The .env has variables: SUPABASE_HOST, SUPABASE_USER, SUPABASE_PASSWORD...
  // We can construct a Postgres connection string!
  
  // Let's try to load 'pg' library. If not installed, we can't run this.
  // We'll check package.json first.
];
}

console.log("⚠️  This script requires direct SQL access. Switching strategy: We will try to rely on 'postgres' npm package if available, or ask user to run SQL manually.");
console.log("Checking package.json for 'pg'...");
// (Script ends here, prompts user or next step handles dependency)
