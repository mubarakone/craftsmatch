import { pgTable, text, uuid, timestamp, integer, jsonb, boolean } from 'drizzle-orm/pg-core';
import { users } from './users';
import { products } from './products';
import { orders } from './orders';

export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  reviewerId: uuid('reviewer_id').notNull().references(() => users.id),
  revieweeId: uuid('reviewee_id').notNull().references(() => users.id),
  productId: uuid('product_id').references(() => products.id),
  orderId: uuid('order_id').references(() => orders.id),
  rating: integer('rating').notNull(),
  title: text('title'),
  content: text('content'),
  response: text('response'),
  responseDate: timestamp('response_date'),
  status: text('status', { enum: ['pending', 'published', 'rejected', 'reported'] }).default('pending').notNull(),
  isPublic: boolean('is_public').default(true).notNull(),
  images: jsonb('images').$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}); 