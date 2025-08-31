import { storage } from '../../server/storage.js';
import { insertMemorySchema } from '../../shared/schema.js';
import { generateEmbedding, generateRelevantTags } from '../../server/services/openai.js';

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const userId = "demo-user";

  if (req.method === 'GET') {
    try {
      const memories = await storage.getMemoriesByUserId(userId);
      res.json(memories);
    } catch (error) {
      console.error("Error fetching memories:", error);
      res.status(500).json({ error: "Failed to fetch memories" });
    }
  } else if (req.method === 'POST') {
    try {
      const result = insertMemorySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.message });
      }

      const memoryData = result.data;
      
      // Generate embedding for the content
      const embedding = await generateEmbedding(`${memoryData.title} ${memoryData.content}`);
      
      // Generate AI-powered tags if none provided
      if (!memoryData.tags || memoryData.tags.length === 0) {
        memoryData.tags = await generateRelevantTags(memoryData.content, memoryData.title, memoryData.type);
      }

      const memory = await storage.createMemory({
        ...memoryData,
        userId,
        embedding,
      });

      res.status(201).json(memory);
    } catch (error) {
      console.error("Error creating memory:", error);
      res.status(500).json({ error: "Failed to create memory" });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}