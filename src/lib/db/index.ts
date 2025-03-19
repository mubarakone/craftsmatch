import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '@/lib/env';

// For use in server components and API routes
const client = postgres(env.DATABASE_URL);
export const db = drizzle(client);

// Helper function to handle database errors
export async function executeWithErrorHandling<T>(
  operation: () => Promise<T>
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const data = await operation();
    return { data, error: null };
  } catch (error) {
    console.error('Database operation failed:', error);
    return { data: null, error: error as Error };
  }
} 