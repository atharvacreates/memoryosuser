import { type User, type UpsertUser, type Memory, type InsertMemory, type ChatSession, type ChatMessage, type Search } from "../shared/schema.js";
import { db } from "./db.js";
import { users, memories, chatSessions, searches } from "../shared/schema.js";
import { eq, desc, and } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  createMemory(memory: InsertMemory & { userId: string; embedding: number[] }): Promise<Memory>;
  getMemoriesByUserId(userId: string): Promise<Memory[]>;
  getMemoryById(id: string): Promise<Memory | undefined>;
  updateMemory(id: string, memory: Partial<InsertMemory & { embedding: number[] }>): Promise<Memory | undefined>;
  deleteMemory(id: string, userId?: string): Promise<boolean>;
  searchMemoriesByEmbedding(userId: string, embedding: number[], limit?: number): Promise<Memory[]>;

  createChatSession(userId: string): Promise<ChatSession>;
  getChatSessionById(id: string): Promise<ChatSession | undefined>;
  updateChatSession(id: string, messages: ChatMessage[]): Promise<ChatSession | undefined>;

  createSearch(userId: string, query: string, results: Memory[]): Promise<Search>;
  getRecentSearches(userId: string, limit?: number): Promise<Search[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Memory operations
  async createMemory(memory: InsertMemory & { userId: string; embedding: number[] }): Promise<Memory> {
    const [newMemory] = await db
      .insert(memories)
      .values({
        ...memory,
        embedding: memory.embedding as any, // Cast for vector type
      })
      .returning();
    return newMemory;
  }

  async getMemoriesByUserId(userId: string): Promise<Memory[]> {
    return await db
      .select()
      .from(memories)
      .where(eq(memories.userId, userId))
      .orderBy(desc(memories.createdAt));
  }

  async getMemoryById(id: string): Promise<Memory | undefined> {
    const [memory] = await db.select().from(memories).where(eq(memories.id, id));
    return memory;
  }

  async updateMemory(id: string, updates: Partial<InsertMemory & { embedding: number[] }>): Promise<Memory | undefined> {
    const [updatedMemory] = await db
      .update(memories)
      .set({
        ...updates,
        ...(updates.embedding && { embedding: updates.embedding as any }),
        updatedAt: new Date(),
      })
      .where(eq(memories.id, id))
      .returning();
    return updatedMemory;
  }

  async deleteMemory(id: string, userId?: string): Promise<boolean> {
    try {
      const whereCondition = userId
        ? and(eq(memories.id, id), eq(memories.userId, userId))
        : eq(memories.id, id);

      const result = await db.delete(memories).where(whereCondition!).returning();
      return result.length > 0;
    } catch (error) {
      console.error("Error deleting memory:", error);
      return false;
    }
  }

  async searchMemoriesByEmbedding(userId: string, embedding: number[], limit = 10, query?: string): Promise<Memory[]> {
    // Get all user memories with their embeddings
    const userMemories = await db
      .select()
      .from(memories)
      .where(eq(memories.userId, userId));

    // Calculate semantic similarity and keyword relevance for each memory
    const memoriesWithRelevance = userMemories
      .map((memory: Memory) => {
        let semanticSimilarity = 0;
        if (memory.embedding) {
          const memoryEmbedding = Array.isArray(memory.embedding)
            ? memory.embedding
            : JSON.parse(memory.embedding as string);
          semanticSimilarity = this.calculateCosineSimilarity(embedding, memoryEmbedding);
        }

        // Calculate keyword similarity as fallback
        let keywordSimilarity = 0;
        if (query) {
          keywordSimilarity = this.calculateKeywordSimilarity(query, memory);
        }

        // Combine semantic and keyword similarities
        const combinedScore = Math.max(semanticSimilarity, keywordSimilarity * 0.7);

        return { ...memory, similarity: combinedScore, semanticSimilarity, keywordSimilarity };
      })
      .filter((memory: any) => memory.similarity > 0.01) // Much lower threshold for better recall
      .sort((a: any, b: any) => b.similarity - a.similarity) // Sort by combined score
      .slice(0, limit);

    // Remove similarity properties from return
    return memoriesWithRelevance.map(({ similarity, semanticSimilarity, keywordSimilarity, ...memory }: any) => memory);
  }

  private calculateKeywordSimilarity(query: string, memory: Memory): number {
    const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    const memoryText = `${memory.title} ${memory.content} ${memory.tags?.join(' ') || ''}`.toLowerCase();

    // Exact matches get high scores
    let score = 0;
    let matchedWords = 0;

    queryWords.forEach(word => {
      if (memoryText.includes(word)) {
        matchedWords++;
        score += 1;
      }

      // Check for partial matches and semantic equivalents
      const semanticMatches = this.getSemanticMatches(word);
      semanticMatches.forEach(match => {
        if (memoryText.includes(match)) {
          score += 0.7;
          matchedWords++;
        }
      });
    });

    // Normalize by query length
    return queryWords.length > 0 ? score / queryWords.length : 0;
  }

  private getSemanticMatches(word: string): string[] {
    const semanticMap: Record<string, string[]> = {
      'japan': ['japanese', 'tokyo', 'kyoto', 'osaka'],
      'trip': ['tour', 'travel', 'journey', 'visit', 'vacation'],
      'tour': ['trip', 'travel', 'journey', 'visit'],
      'travel': ['trip', 'tour', 'journey', 'visit'],
      'birthday': ['celebration', 'party', 'anniversary'],
      'friend': ['friendship', 'buddy', 'pal'],
      'habit': ['habits', 'routine', 'practice'],
      'routine': ['habit', 'schedule', 'daily'],
      'morning': ['early', 'dawn', 'sunrise'],
      'ai': ['artificial intelligence', 'machine learning', 'neural'],
      'learning': ['education', 'study', 'knowledge'],
    };

    return semanticMap[word] || [];
  }

  private calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) return 0;

    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

    if (magnitudeA === 0 || magnitudeB === 0) return 0;

    return dotProduct / (magnitudeA * magnitudeB);
  }

  // Chat session operations
  async createChatSession(userId: string): Promise<ChatSession> {
    const [chatSession] = await db
      .insert(chatSessions)
      .values({
        userId,
        messages: [],
      })
      .returning();
    return chatSession;
  }

  async getChatSessionById(id: string): Promise<ChatSession | undefined> {
    const [session] = await db.select().from(chatSessions).where(eq(chatSessions.id, id));
    return session;
  }

  async updateChatSession(id: string, messages: ChatMessage[]): Promise<ChatSession | undefined> {
    const [updatedSession] = await db
      .update(chatSessions)
      .set({ messages: messages as any })
      .where(eq(chatSessions.id, id))
      .returning();
    return updatedSession;
  }

  // Search operations
  async createSearch(userId: string, query: string, results: Memory[]): Promise<Search> {
    const [search] = await db
      .insert(searches)
      .values({
        userId,
        query,
        results: results as any,
      })
      .returning();
    return search;
  }

  async getRecentSearches(userId: string, limit = 10): Promise<Search[]> {
    return await db
      .select()
      .from(searches)
      .where(eq(searches.userId, userId))
      .orderBy(desc(searches.createdAt))
      .limit(limit);
  }
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private memories: Map<string, Memory>;
  private chatSessions: Map<string, ChatSession>;
  private searches: Map<string, Search>;

  constructor() {
    this.users = new Map();
    this.memories = new Map();
    this.chatSessions = new Map();
    this.searches = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const id = userData.id || randomUUID();
    const newUser: User = {
      ...userData,
      id,
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      createdAt: userData.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async createMemory(memory: InsertMemory & { userId: string; embedding: number[] }): Promise<Memory> {
    const id = randomUUID();
    const now = new Date();
    const newMemory: Memory = {
      id,
      ...memory,
      source: memory.source || null,
      summary: memory.summary || null,
      priority: memory.priority || null,
      status: memory.status || null,
      linkedMemories: memory.linkedMemories || null,
      tags: memory.tags || [],
      embedding: memory.embedding as any, // Type assertion for vector field
      createdAt: now,
      updatedAt: now,
    };
    this.memories.set(id, newMemory);
    return newMemory;
  }

  async getMemoriesByUserId(userId: string): Promise<Memory[]> {
    return Array.from(this.memories.values()).filter(
      (memory) => memory.userId === userId
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getMemoryById(id: string): Promise<Memory | undefined> {
    return this.memories.get(id);
  }

  async updateMemory(id: string, updates: Partial<InsertMemory & { embedding: number[] }>): Promise<Memory | undefined> {
    const memory = this.memories.get(id);
    if (!memory) return undefined;

    const updatedMemory: Memory = {
      ...memory,
      ...updates,
      embedding: updates.embedding as any || memory.embedding,
      updatedAt: new Date(),
    };
    this.memories.set(id, updatedMemory);
    return updatedMemory;
  }

  async deleteMemory(id: string, userId?: string): Promise<boolean> {
    // For MemStorage, add basic user check if userId provided
    if (userId) {
      const memory = this.memories.get(id);
      if (!memory || memory.userId !== userId) {
        return false;
      }
    }
    return this.memories.delete(id);
  }

  async searchMemoriesByEmbedding(userId: string, embedding: number[], limit = 10, query?: string): Promise<Memory[]> {
    const userMemories = Array.from(this.memories.values()).filter(
      (memory) => memory.userId === userId
    );

    // Calculate semantic similarity and keyword relevance for each memory
    const memoriesWithRelevance = userMemories
      .map((memory: Memory) => {
        let semanticSimilarity = 0;
        if (memory.embedding) {
          const memoryEmbedding = Array.isArray(memory.embedding)
            ? memory.embedding
            : JSON.parse(memory.embedding as string);
          semanticSimilarity = this.calculateCosineSimilarity(embedding, memoryEmbedding);
        }

        // Calculate keyword similarity as fallback
        let keywordSimilarity = 0;
        if (query) {
          keywordSimilarity = this.calculateKeywordSimilarity(query, memory);
        }

        // Combine semantic and keyword similarities
        const combinedScore = Math.max(semanticSimilarity, keywordSimilarity * 0.7);

        return { ...memory, similarity: combinedScore };
      })
      .filter((memory: any) => memory.similarity > 0.01) // Much lower threshold for better recall
      .sort((a: any, b: any) => b.similarity - a.similarity) // Sort by combined score
      .slice(0, limit);

    // Remove similarity property from return
    return memoriesWithRelevance.map(({ similarity, ...memory }: any) => memory);
  }

  private calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) return 0;

    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

    if (magnitudeA === 0 || magnitudeB === 0) return 0;

    return dotProduct / (magnitudeA * magnitudeB);
  }

  private calculateKeywordSimilarity(query: string, memory: Memory): number {
    const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    const memoryText = `${memory.title} ${memory.content} ${memory.tags?.join(' ') || ''}`.toLowerCase();

    // Exact matches get high scores
    let score = 0;
    let matchedWords = 0;

    queryWords.forEach(word => {
      if (memoryText.includes(word)) {
        matchedWords++;
        score += 1;
      }

      // Check for partial matches and semantic equivalents
      const semanticMatches = this.getSemanticMatches(word);
      semanticMatches.forEach(match => {
        if (memoryText.includes(match)) {
          score += 0.7;
          matchedWords++;
        }
      });
    });

    // Normalize by query length
    return queryWords.length > 0 ? score / queryWords.length : 0;
  }

  private getSemanticMatches(word: string): string[] {
    const semanticMap: Record<string, string[]> = {
      'japan': ['japanese', 'tokyo', 'kyoto', 'osaka'],
      'trip': ['tour', 'travel', 'journey', 'visit', 'vacation'],
      'tour': ['trip', 'travel', 'journey', 'visit'],
      'travel': ['trip', 'tour', 'journey', 'visit'],
      'birthday': ['celebration', 'party', 'anniversary'],
      'friend': ['friendship', 'buddy', 'pal'],
      'habit': ['habits', 'routine', 'practice'],
      'routine': ['habit', 'schedule', 'daily'],
      'morning': ['early', 'dawn', 'sunrise'],
      'ai': ['artificial intelligence', 'machine learning', 'neural'],
      'learning': ['education', 'study', 'knowledge'],
      'uber': ['driver', 'ride', 'transportation', 'car'],
      'driver': ['uber', 'lyft', 'transportation', 'car'],
      'insights': ['learnings', 'observations', 'findings', 'discoveries'],
      'learnings': ['insights', 'observations', 'findings', 'discoveries'],
    };

    return semanticMap[word] || [];
  }

  async createChatSession(userId: string): Promise<ChatSession> {
    const id = randomUUID();
    const chatSession: ChatSession = {
      id,
      userId,
      messages: [],
      createdAt: new Date(),
    };
    this.chatSessions.set(id, chatSession);
    return chatSession;
  }

  async getChatSessionById(id: string): Promise<ChatSession | undefined> {
    return this.chatSessions.get(id);
  }

  async updateChatSession(id: string, messages: ChatMessage[]): Promise<ChatSession | undefined> {
    const session = this.chatSessions.get(id);
    if (!session) return undefined;

    const updatedSession: ChatSession = {
      ...session,
      messages: messages as any,
    };
    this.chatSessions.set(id, updatedSession);
    return updatedSession;
  }

  async createSearch(userId: string, query: string, results: Memory[]): Promise<Search> {
    const id = randomUUID();
    const search: Search = {
      id,
      userId,
      query,
      results: results as any,
      createdAt: new Date(),
    };
    this.searches.set(id, search);
    return search;
  }

  async getRecentSearches(userId: string, limit = 10): Promise<Search[]> {
    return Array.from(this.searches.values())
      .filter((search) => search.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
}

// Always use DatabaseStorage for production deployment
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("SUPABASE_DATABASE_URL:", process.env.SUPABASE_DATABASE_URL ? "SET" : "NOT SET");

// Initialize storage - always use DatabaseStorage for production
console.log("Initializing DatabaseStorage for production mode");
const storageInstance: IStorage = new DatabaseStorage();

export const storage = storageInstance;
