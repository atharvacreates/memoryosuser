import { storage } from '../server/storage.js';
import { chatMessageSchema } from '../shared/schema.js';
import { generateEmbedding, generateChatResponse } from '../server/services/openai.js';

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

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const result = chatMessageSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.message });
    }

    const { messages } = result.data;
    const lastMessage = messages[messages.length - 1];

    if (!lastMessage || lastMessage.role !== "user") {
      return res.status(400).json({ error: "Last message must be from user" });
    }

    // Search for relevant memories using enhanced search
    const queryEmbedding = await generateEmbedding(lastMessage.content);
    const relevantMemories = await storage.searchMemoriesByEmbedding("shared-user", queryEmbedding, 5, lastMessage.content);

    // Build context from relevant memories
    const context = relevantMemories.length > 0
      ? relevantMemories.map(memory =>
        `[${memory.type.toUpperCase()}] ${memory.title}: ${memory.content}${memory.tags && memory.tags.length > 0 ? ` (Tags: ${memory.tags.join(', ')})` : ''
        }`
      ).join('\n\n')
      : '';

    // Generate AI response
    const response = await generateChatResponse(messages, context);

    res.json({ message: response });
  } catch (error) {
    console.error("Error in chat:", error);
    res.status(500).json({ error: "Failed to process chat message" });
  }
}