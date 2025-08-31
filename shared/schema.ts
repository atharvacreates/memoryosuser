import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Sessions table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table compatible with Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const memories = pgTable("memories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(), // 'idea', 'note', 'learning', 'task'
  tags: text("tags").array().default([]),
  embedding: jsonb("embedding"), // Store as JSONB for compatibility
  priority: text("priority").default("medium"), // 'low', 'medium', 'high', 'urgent'
  status: text("status").default("active"), // 'active', 'archived', 'completed'
  source: text("source"), // Where this memory came from (meeting, book, conversation, etc.)
  linkedMemories: text("linked_memories").array().default([]), // IDs of related memories
  summary: text("summary"), // AI-generated concise summary
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const chatSessions = pgTable("chat_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  messages: jsonb("messages").notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const searches = pgTable("searches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  query: text("query").notNull(),
  results: jsonb("results").notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  memories: many(memories),
  chatSessions: many(chatSessions),
  searches: many(searches),
}));

export const memoriesRelations = relations(memories, ({ one }) => ({
  user: one(users, { fields: [memories.userId], references: [users.id] }),
}));

export const chatSessionsRelations = relations(chatSessions, ({ one }) => ({
  user: one(users, { fields: [chatSessions.userId], references: [users.id] }),
}));

export const searchesRelations = relations(searches, ({ one }) => ({
  user: one(users, { fields: [searches.userId], references: [users.id] }),
}));

export const insertMemorySchema = createInsertSchema(memories).omit({
  id: true,
  userId: true,
  embedding: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  tags: z.array(z.string()).optional(),
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  timestamp: z.string(),
});

export const searchQuerySchema = z.object({
  query: z.string().min(1),
  type: z.enum(['idea', 'note', 'learning', 'task', 'all']).optional(),
});

// Types for Replit Auth compatibility
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertMemory = z.infer<typeof insertMemorySchema>;
export type Memory = typeof memories.$inferSelect;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type ChatSession = typeof chatSessions.$inferSelect;
export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;
export type Search = typeof searches.$inferSelect;
