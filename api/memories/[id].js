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

  const { id } = req.query;
  const userId = "shared-user";

  if (req.method === 'PUT') {
    try {
      const result = insertMemorySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.message });
      }

      const memoryData = result.data;

      // Generate new embedding for updated content
      const embedding = await generateEmbedding(`${memoryData.title} ${memoryData.content}`);

      // Generate AI-powered tags if none provided
      if (!memoryData.tags || memoryData.tags.length === 0) {
        memoryData.tags = await generateRelevantTags(memoryData.content, memoryData.title, memoryData.type);
      }

      const updatedMemory = await storage.updateMemory(id, {
        ...memoryData,
        embedding,
      });

      if (!updatedMemory) {
        return res.status(404).json({ error: "Memory not found" });
      }

      res.json(updatedMemory);
    } catch (error) {
      console.error("Error updating memory:", error);
      res.status(500).json({ error: "Failed to update memory" });
    }
  } else if (req.method === 'DELETE') {
    try {
      const deleted = await storage.deleteMemory(id, userId);

      if (!deleted) {
        return res.status(404).json({ error: "Memory not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting memory:", error);
      res.status(500).json({ error: "Failed to delete memory" });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}