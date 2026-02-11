require('dotenv').config();
const { supabase } = require('../config/supabaseClient');
const { generateEmbedding } = require('../services/ragService');
const { EXACT_RESPONSES, FAQ, POLICIES, SERVICES } = require('../data/knowledgeBase');

async function seedKnowledgeBase() {
  console.log("🚀 Starting Knowledge Base Seeding...");

  const knowledgeItems = [];

  // 1. Process EXACT RESPONSES
  for (const [key, value] of Object.entries(EXACT_RESPONSES)) {
    console.log(`Processing Exact Response: ${key}`);
    const embedding = await generateEmbedding(value);
    if (embedding) {
      knowledgeItems.push({
        category: 'exact_response',
        question: key, // Using key as identifier/question context
        answer: value,
        embedding,
        metadata: { type: 'exact', key }
      });
    }
    // Rate limit prevention (simple delay)
    await new Promise(r => setTimeout(r, 200)); 
  }

  // 2. Process POLICIES
  for (const [key, value] of Object.entries(POLICIES)) {
     console.log(`Processing Policy: ${key}`);
     const text = typeof value === 'string' ? value : JSON.stringify(value);
     const embedding = await generateEmbedding(text);
     if (embedding) {
      knowledgeItems.push({
        category: 'policy',
        question: key,
        answer: text,
        embedding,
        metadata: { type: 'policy', key }
      });
     }
     await new Promise(r => setTimeout(r, 200));
  }

  // 3. Process FAQ (Simulated - if you have an FAQ object in knowledgeBase)
  // Assuming FAQ structure exists or will be added. 
  // If not currently in knowledgeBase.js, we skip or add placeholders.
  if (typeof FAQ !== 'undefined') {
      for (const item of FAQ) {
        console.log(`Processing FAQ: ${item.question}`);
        const embedding = await generateEmbedding(item.question);
        if (embedding) {
            knowledgeItems.push({
                category: 'faq',
                question: item.question,
                answer: item.answer,
                embedding,
                metadata: { type: 'faq' }
            });
        }
        await new Promise(r => setTimeout(r, 200));
      }
  }

  if (knowledgeItems.length === 0) {
      console.log("⚠️ No items to insert.");
      return;
  }

  console.log(`💾 Inserting ${knowledgeItems.length} items into Supabase...`);
  
  const { error } = await supabase
    .from('knowledge_base')
    .insert(knowledgeItems);

  if (error) {
    console.error("❌ Error inserting data:", error);
  } else {
    console.log("✅ Knowledge Base Seeded Successfully!");
  }
}

seedKnowledgeBase();
