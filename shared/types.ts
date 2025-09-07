import { memories } from './schema';
import { InferModel } from 'drizzle-orm';

// Base memory type from schema
export type Memory = InferModel<typeof memories>;

// Type for memory with similarity score from vector search
export interface MemoryWithSimilarity extends Memory {
    similarity?: number;
}
