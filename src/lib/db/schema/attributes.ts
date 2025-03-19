import { pgTable, text, uuid, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { categories } from './categories';

export const attributes = pgTable('attributes', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  description: text('description'),
  type: text('type', { enum: ['text', 'number', 'boolean', 'select', 'multiselect'] }).notNull(),
  options: jsonb('options').$type<string[]>(),
  unit: text('unit'),
  isRequired: boolean('is_required').default(false).notNull(),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// We'll define the relations in the index.ts file to avoid circular dependencies 