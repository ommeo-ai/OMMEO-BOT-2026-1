const { supabase } = require('../config/supabaseClient');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Embedding model for semantic search
let embeddingModel = null;

try {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
} catch (e) {
  console.warn('[RAG] ⚠️ Embedding model not initialized');
}

/**
 * Search knowledge base for relevant context
 * @param {string} query - User's message
 * @param {number} limit - Max results
 * @returns {Promise<string>} - Relevant context
 */
async function searchKnowledge(query, limit = 3) {
  if (!supabase || !embeddingModel) {
    console.log('[RAG] Skipping search (missing dependencies)');
    return '';
  }

  try {
    // 1. Generate embedding for query
    const result = await embeddingModel.embedContent(query);
    const queryEmbedding = result.embedding.values;

    // 2. Search with semantic similarity
    const { data, error } = await supabase.rpc('match_knowledge', {
      query_embedding: queryEmbedding,
      match_threshold: 0.5,
      match_count: limit
    });

    if (error) {
      console.error('[RAG] Search error:', error.message);
      return '';
    }

    if (!data || data.length === 0) {
      console.log('[RAG] No relevant knowledge found');
      return '';
    }

    // 3. Format results as context
    const context = data
      .map(item => `[${item.category?.toUpperCase() || 'INFO'}]: ${item.content}`)
      .join('\n\n');

    console.log(`[RAG] ✅ Found ${data.length} relevant documents`);
    return context;

  } catch (error) {
    console.error('[RAG] ❌ Error:', error.message);
    return '';
  }
}

/**
 * Add new knowledge to the base
 * @param {string} content - Knowledge content
 * @param {string} category - Category
 * @param {object} metadata - Additional metadata
 */
async function addKnowledge(content, category, metadata = {}) {
  if (!supabase || !embeddingModel) {
    throw new Error('Missing dependencies');
  }

  // Generate embedding
  const result = await embeddingModel.embedContent(content);
  const embedding = result.embedding.values;

  // Insert into database
  const { error } = await supabase
    .from('knowledge_base')
    .insert({
      content,
      category,
      embedding,
      metadata
    });

  if (error) throw error;
  console.log('[RAG] ✅ Knowledge added');
}

module.exports = { searchKnowledge, addKnowledge };
