const { VertexAI } = require('@google-cloud/vertexai');
const { Firestore } = require('@google-cloud/firestore');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
const location = 'us-central1';

// Init Clients
const vertex_ai = new VertexAI({ project: projectId, location: location });
const firestore = new Firestore({ projectId });
const vectorsCollection = firestore.collection('vectors');

// Text Embedding Gecko (or multilang)
const embeddingModel = vertex_ai.getGenerativeModel({ model: 'text-embedding-004' });

const KNOWLEDGE_DIR = './knowledge';

async function generateEmbedding(text) {
  const result = await embeddingModel.embedContent(text);
  const embedding = result.embedding;
  return embedding.values; // Vector array
}

async function ingestFiles() {
  if (!fs.existsSync(KNOWLEDGE_DIR)) {
    console.error(`Directory ${KNOWLEDGE_DIR} does not exist.`);
    return;
  }

  const files = fs.readdirSync(KNOWLEDGE_DIR);
  
  for (const file of files) {
    if (file.endsWith('.txt') || file.endsWith('.md')) {
      const filePath = path.join(KNOWLEDGE_DIR, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      console.log(`Processing ${file}...`);

      // Simple chunking (Split by paragraphs roughly)
      // In production, use a smarter splitter (e.g. LangChain recursive splitter)
      const chunks = content.split(/\n\s*\n/).filter(c => c.length > 50);

      for (let i = 0; i < chunks.length; i++) {
        const chunkText = chunks[i].trim();
        try {
          const vector = await generateEmbedding(chunkText);
          
          await vectorsCollection.add({
            sourceObject: file,
            text: chunkText,
            embedding: vector, // Firestore Vector Search field
            createdAt: new Date()
          });
          
          console.log(`Saved chunk ${i} of ${file}`);
        } catch (err) {
          console.error(`Error embedding chunk ${i}:`, err.message);
        }
      }
    }
  }
  console.log('Ingestion Complete');
}

ingestFiles().catch(console.error);
