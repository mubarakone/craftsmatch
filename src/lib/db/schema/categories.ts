import { pgTable, text, uuid, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Use type import to avoid circular references
import type { products } from './products';
import type { attributes } from './attributes';

// Explicitly type the categories table to fix the circular reference issue
export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  description: text('description'),
  parentId: uuid('parent_id').references((): any => categories.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// We'll define relations in the index.ts file to avoid circular dependencies 