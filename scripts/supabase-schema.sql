-- =============================================
-- OMMEO Bot v3.0 - Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable pgvector for RAG
CREATE EXTENSION IF NOT EXISTS vector;

-- =============================================
-- TABLE: conversations
-- Stores chat history and user metadata
-- =============================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL UNIQUE,
  name TEXT,
  history JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  lead_score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'handoff', 'converted', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conv_phone ON conversations(phone_number);
CREATE INDEX IF NOT EXISTS idx_conv_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conv_updated ON conversations(updated_at DESC);

-- =============================================
-- TABLE: knowledge_base
-- RAG knowledge with vector embeddings
-- =============================================
CREATE TABLE IF NOT EXISTS knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding vector(768),
  category TEXT,
  priority INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kb_category ON knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_kb_embedding ON knowledge_base 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Function for semantic search
CREATE OR REPLACE FUNCTION match_knowledge(
  query_embedding vector(768),
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 3
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  category TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.content,
    kb.category,
    1 - (kb.embedding <=> query_embedding) AS similarity
  FROM knowledge_base kb
  WHERE 1 - (kb.embedding <=> query_embedding) > match_threshold
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- =============================================
-- TABLE: bookings
-- Service booking requests
-- =============================================
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,
  conversation_id UUID REFERENCES conversations(id),
  service_type TEXT NOT NULL CHECK (service_type IN ('limpieza', 'mascotas', 'unas', 'barberia')),
  requested_date DATE,
  requested_time TEXT,
  zone TEXT,
  address TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'assigned', 'completed', 'cancelled')),
  notes TEXT,
  assigned_professional_id UUID,
  price DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_book_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_book_date ON bookings(requested_date);
CREATE INDEX IF NOT EXISTS idx_book_phone ON bookings(phone_number);

-- =============================================
-- TABLE: handoffs
-- Human escalation tracking
-- =============================================
CREATE TABLE IF NOT EXISTS handoffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,
  conversation_id UUID REFERENCES conversations(id),
  reason TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'resolved')),
  assigned_to TEXT,
  conversation_summary TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_handoff_status ON handoffs(status);
CREATE INDEX IF NOT EXISTS idx_handoff_priority ON handoffs(priority);

-- =============================================
-- TABLE: analytics
-- Event tracking
-- =============================================
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  phone_number TEXT,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics(created_at DESC);

-- Partitioning for analytics (optional, for scale)
-- CREATE INDEX IF NOT EXISTS idx_analytics_month ON analytics(date_trunc('month', created_at));

-- =============================================
-- ROW LEVEL SECURITY (Optional but recommended)
-- =============================================
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE handoffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "Service role full access conversations" ON conversations
  FOR ALL USING (true);
CREATE POLICY "Service role full access bookings" ON bookings
  FOR ALL USING (true);
CREATE POLICY "Service role full access handoffs" ON handoffs
  FOR ALL USING (true);
CREATE POLICY "Service role full access analytics" ON analytics
  FOR ALL USING (true);
CREATE POLICY "Service role full access knowledge" ON knowledge_base
  FOR ALL USING (true);

-- =============================================
-- INITIAL KNOWLEDGE BASE DATA
-- =============================================
INSERT INTO knowledge_base (content, category, priority, metadata) VALUES
-- Servicios de Limpieza
('Los servicios de limpieza de OMMEO incluyen: limpieza profunda, limpieza regular de mantenimiento, y limpieza post-obra. Todos nuestros profesionales están verificados con antecedentes judiciales.', 'limpieza', 10, '{"service": "limpieza"}'),
('El pago de los servicios OMMEO se realiza directamente al profesional al finalizar el servicio. Aceptamos efectivo y transferencia.', 'general', 10, '{"topic": "pagos"}'),
('Para agendar un servicio necesitamos: 1) Tipo de servicio, 2) Fecha y hora preferida, 3) Zona o barrio, 4) Tu nombre.', 'general', 10, '{"topic": "agendamiento"}'),
('Nuestros profesionales de limpieza llegan con todos los implementos básicos. Si tienes productos específicos que prefieres usar, puedes indicarlo.', 'limpieza', 5, '{"service": "limpieza"}'),

-- Servicios de Mascotas
('Los servicios para mascotas incluyen: paseo de perros, guardería diurna, y baño a domicilio. Todos los cuidadores están certificados y verificados.', 'mascotas', 10, '{"service": "mascotas"}'),
('El paseo de perros tiene una duración estándar de 30 minutos. Podemos ajustar según las necesidades de tu mascota.', 'mascotas', 5, '{"service": "mascotas"}'),

-- Servicios de Uñas
('Los servicios de uñas incluyen: manicure tradicional, pedicure, uñas acrílicas, y diseños personalizados. Todo a domicilio.', 'unas', 10, '{"service": "unas"}'),
('Nuestras profesionales de uñas traen todos los materiales necesarios. El servicio típico dura entre 1 y 2 horas.', 'unas', 5, '{"service": "unas"}'),

-- Servicios de Barbería
('Los servicios de barbería incluyen: corte de cabello, arreglo de barba, afeitado clásico. Barberos profesionales a domicilio.', 'barberia', 10, '{"service": "barberia"}'),
('Nuestros barberos traen todas sus herramientas profesionales. El servicio típico dura entre 30 y 45 minutos.', 'barberia', 5, '{"service": "barberia"}'),

-- Información General
('OMMEO opera actualmente en las principales ciudades de Colombia: Bogotá, Medellín, Cali, Barranquilla, y Cartagena.', 'general', 8, '{"topic": "cobertura"}'),
('Todos los profesionales de OMMEO pasan por un proceso de verificación que incluye: verificación de identidad, antecedentes judiciales, y entrevista personal.', 'general', 10, '{"topic": "seguridad"}'),
('Puedes cancelar o reprogramar tu servicio hasta 2 horas antes sin costo. Cancelaciones tardías pueden tener un cargo.', 'general', 7, '{"topic": "cancelaciones"}'),
('OMMEO ofrece garantía de satisfacción. Si no estás satisfecho con el servicio, te ayudamos a resolverlo.', 'general', 9, '{"topic": "garantia"}')

ON CONFLICT DO NOTHING;

-- =============================================
-- DONE! 🎉
-- =============================================
