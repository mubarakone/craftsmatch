import { pgTable, text, uuid, timestamp } from 'drizzle-orm/pg-core';

// Explicitly type the categories table to fix the circular reference issue
export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  description: text('description'),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parentId: uuid('parent_id').references((): any => categories.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// We'll define relations in the index.ts file to avoid circular dependencies 