const { genAI } = require('../config/geminiClient');
const { supabase } = require('../config/supabaseClient');

/**
 * Generates an embedding vector for a given text using Gemini.
 * @param {string} text - The input text to embed.
 * @returns {Promise<Array<number>>} - The embedding vector.
 */
async function generateEmbedding(text) {
  try {
    if (!genAI) {
      console.error("FATAL: genAI instance is null. Check API key.");
      return null;
    }
    const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await embeddingModel.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error("Error generating embedding:", error);
    return null;
  }
}

/**
 * Searches the knowledge base for similar content.
 * @param {string} query - The user's query.
 * @param {number} threshold - Similarity threshold (0-1).
 * @returns {Promise<Array>} - Array of matching knowledge items.
 */
async function searchKnowledge(query, threshold = 0.75) {
  try {
    const queryEmbedding = await generateEmbedding(query);
    if (!queryEmbedding) return [];

    const { data, error } = await supabase.rpc('match_knowledge', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: 5
    });

    if (error) {
      console.error("Supabase vector search error:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Critical error in searchKnowledge:", err);
    return [];
  }
}

module.exports = {
  generateEmbedding,
  searchKnowledge
};
