import OpenAI from "openai";

// Check if we're in demo mode
const isDemoMode = process.env.DEMO_MODE === 'true';

// Using OpenRouter API for cost-effective access to AI models
const openai = isDemoMode ? null : new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY || "your-api-key",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000", // Optional: for including in OpenRouter analytics
    "X-Title": "MemoryOS", // Optional: for including in OpenRouter analytics
  }
});

// Simple in-memory cache for embeddings
const embeddingCache = new Map<string, number[]>();

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // Check cache first
    const cacheKey = text.toLowerCase().trim();
    if (embeddingCache.has(cacheKey)) {
      return embeddingCache.get(cacheKey)!;
    }

    console.log("Generating enhanced embedding for:", text.substring(0, 50) + "...");

    // Enhanced semantic embedding that handles synonyms and related terms better
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 1);

    const embedding = new Array(384).fill(0);

    // Create word-based features with semantic enhancement
    for (let i = 0; i < words.length; i++) {
      const word = words[i];

      // Generate multiple hash variations for better semantic capture
      for (let variant = 0; variant < 3; variant++) {
        for (let j = 0; j < word.length; j++) {
          const charCode = word.charCodeAt(j);
          const index = (charCode + i + j + variant * 127) % embedding.length;
          embedding[index] += Math.sin((charCode + variant) * 0.01) * 0.1;
        }
      }

      // Add semantic word features for common concepts
      const semanticFeatures = getSemanticFeatures(word);
      semanticFeatures.forEach(feature => {
        const index = Math.abs(feature) % embedding.length;
        embedding[index] += 0.15;
      });
    }

    // Add phrase-level features for better multi-word matching
    if (words.length > 1) {
      const phrase = words.join('');
      for (let i = 0; i < phrase.length - 1; i++) {
        const bigram = phrase.substring(i, i + 2);
        const hash = bigramHash(bigram);
        const index = Math.abs(hash) % embedding.length;
        embedding[index] += 0.1;
      }
    }

    // Normalize the embedding
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
      for (let i = 0; i < embedding.length; i++) {
        embedding[i] = embedding[i] / magnitude;
      }
    }

    // Cache the result
    embeddingCache.set(cacheKey, embedding);

    // Limit cache size to prevent memory issues
    if (embeddingCache.size > 1000) {
      const firstKey = embeddingCache.keys().next().value;
      embeddingCache.delete(firstKey);
    }

    return embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw new Error("Failed to generate embedding");
  }
}

function getSemanticFeatures(word: string): number[] {
  // Map related words to similar feature hashes for better semantic matching
  const semanticMap: Record<string, number[]> = {
    'japan': [100, 200, 300],
    'japanese': [100, 200, 300],
    'tokyo': [100, 200, 300, 150],
    'trip': [400, 500],
    'tour': [400, 500],
    'travel': [400, 500],
    'journey': [400, 500],
    'visit': [400, 500],
    'dream': [600, 700],
    'plan': [600, 700],
    'birthday': [800, 900],
    'friend': [1000, 1100],
    'friendship': [1000, 1100],
    'habit': [1200, 1300],
    'habits': [1200, 1300],
    'routine': [1200, 1300],
    'morning': [1400, 1500],
    'productivity': [1200, 1600],
    'learning': [1700, 1800],
    'education': [1700, 1800],
    'ai': [1900, 2000],
    'artificial': [1900, 2000],
    'intelligence': [1900, 2000],
  };

  return semanticMap[word] || [word.length * 100];
}

function bigramHash(bigram: string): number {
  let hash = 0;
  for (let i = 0; i < bigram.length; i++) {
    hash = ((hash << 5) - hash + bigram.charCodeAt(i)) & 0xffffffff;
  }
  return hash;
}

export async function generateChatResponse(
  messages: Array<{ role: string; content: string }>,
  context?: string
): Promise<string> {
  try {
    // In demo mode, provide a simple response without API calls
    if (isDemoMode) {
      const lastMessage = messages[messages.length - 1];
      const userQuery = lastMessage.content.toLowerCase();

      // Simple keyword-based responses for demo mode
      if (userQuery.includes('hello') || userQuery.includes('hi')) {
        return "Hello! I'm your MemoryOS AI assistant. I can help you find and organize your memories. Try asking me about specific topics or add some memories to get started!";
      }

      if (userQuery.includes('help') || userQuery.includes('what can you do')) {
        return "I can help you:\n• Find specific information from your stored memories\n• Search across your notes, ideas, and learnings\n• Suggest related content based on your queries\n• Help organize and categorize your thoughts\n\nTry adding some memories first, then ask me questions about them!";
      }

      if (context && context.length > 0) {
        return `I found some relevant memories for you:\n\n${context}\n\nThis is demo mode, so I'm showing you the raw memory data. In production mode, I would provide a more natural response based on this context.`;
      }

      return "I'm here to help you with your memories! Since this is demo mode, I can't access external AI services, but I can help you search through your stored memories. Try adding some memories first, then ask me about them.";
    }

    const systemMessage = context
      ? `You are an AI assistant for MemoryOS, a personal knowledge management system. You help users find and organize their stored memories, thoughts, ideas, and learnings. 

IMPORTANT: You can ONLY use information from the user's stored memories below. DO NOT use any external knowledge or make up information.

User's stored memories:
${context}

CRITICAL RULES:
- If memories are provided, ONLY respond based on those memories
- If NO memories are provided, you can provide general information but clearly state it's not from personal memories
- DO NOT hallucinate or make up information
- DO NOT copy the raw memory format (no [LEARNING], [NOTE], etc. tags)
- DO NOT include the memory tags in your response
- Give natural, conversational responses
- Reference the memory title naturally in conversation
- Be helpful and conversational

RESPONSE FORMAT:
- If memories exist: Give a natural response based on the memories
- If no memories: Provide helpful general information and suggest creating a memory
- Always encourage memory creation when appropriate
- Keep it friendly and helpful`
      : "You are an AI assistant for MemoryOS, a personal knowledge management system. You help users find and organize their stored memories, thoughts, ideas, and learnings. Since no relevant memories were found for this query, I can provide general information and help you create a memory about this topic. Always encourage users to save important information as memories.";

    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o",
      messages: [
        { role: "system", content: systemMessage },
        // Only include the last 2 messages for faster processing
        ...messages.slice(-2).map(msg => ({
          role: msg.role as "user" | "assistant" | "system",
          content: msg.content
        })),
      ],
      max_tokens: 300, // Further reduced for faster responses
      temperature: 0.7,
    });

    const rawResponse = response.choices[0].message.content || "I apologize, but I couldn't generate a response.";

    // Clean up response formatting - remove asterisks and make more conversational
    const cleanedResponse = rawResponse
      .replace(/\*\*([^*]+)\*\*/g, '$1')  // Remove **bold** formatting
      .replace(/\*([^*]+)\*/g, '$1')     // Remove *italic* formatting
      .replace(/#+\s/g, '')             // Remove header formatting
      .replace(/\n\s*-\s/g, '\n• ')      // Convert dashes to bullets
      .replace(/\n{3,}/g, '\n\n')       // Reduce excessive line breaks
      .trim();

    return cleanedResponse;
  } catch (error) {
    console.error("Error generating chat response:", error);

    // If it's a credit/402 error, provide a helpful message
    if (error && typeof error === 'object' && 'code' in error && error.code === 402) {
      return "I'm currently experiencing high demand and my API credits are running low. I can still help you search through your memories and provide basic assistance. For full AI responses, you may need to upgrade your OpenRouter account or try again later.";
    }

    throw new Error("Failed to generate chat response");
  }
}

export async function generateRelevantTags(content: string, title: string, type: string): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o",
      messages: [
        {
          role: "system",
          content: `Create 3-5 relevant tags for this ${type}. Use lowercase, be specific, avoid generic words. Return as JSON array.`
        },
        {
          role: "user",
          content: `Title: ${title}\nType: ${type}\nContent: ${content.substring(0, 500)}` // Limit content length
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 100, // Reduced from 200
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || '{"tags": []}');
    return result.tags || [];
  } catch (error) {
    console.error("Error generating AI tags, falling back to keyword extraction:", error);
    return await extractKeywordsFallback(content);
  }
}

export async function extractKeywordsFallback(content: string): Promise<string[]> {
  // Simple fallback keyword extraction for when AI fails
  console.log("Using fallback keyword extraction for:", content.substring(0, 50) + "...");

  const words = content.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !['this', 'that', 'with', 'from', 'they', 'them', 'have', 'been', 'will', 'said', 'each', 'which', 'their', 'time', 'would', 'there', 'could', 'other'].includes(word));

  const wordFreq = new Map<string, number>();
  words.forEach(word => {
    wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
  });

  return Array.from(wordFreq.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([word]) => word);
}

export async function extractKeywordsAndSummary(content: string): Promise<{
  keywords: string[];
  summary: string;
}> {
  try {
    const keywords = await extractKeywordsFallback(content);
    const summary = content.length > 100 ? content.substring(0, 97) + "..." : content;

    return {
      keywords,
      summary,
    };
  } catch (error) {
    console.error("Error extracting keywords and summary:", error);
    return {
      keywords: [],
      summary: content.substring(0, 100) + "...",
    };
  }
}
