/* eslint-disable @typescript-eslint/no-unused-vars */
import { pgTable, text, uuid, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { users } from './users';
import { products } from './products';
import { orders } from './orders';

export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id),
  productId: uuid('product_id').notNull().references(() => products.id),
  reviewerId: uuid('reviewer_id').notNull().references(() => users.id),
  recipientId: uuid('recipient_id').notNull().references(() => users.id),
  rating: integer('rating').notNull(),
  reviewTitle: text('review_title'),
  reviewContent: text('review_content'),
  reply: text('reply'),
  replyDate: timestamp('reply_date'),
  isPublished: boolean('is_published').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}); 