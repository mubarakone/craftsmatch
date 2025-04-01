import { pgTable, text, uuid, timestamp, boolean, integer, doublePrecision } from 'drizzle-orm/pg-core';
import { users } from './users';
import { categories } from './categories';
import { attributes } from './attributes';

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  description: text('description').notNull(),
  craftmanId: uuid('craftsman_id').notNull().references(() => users.id),
  storefrontId: uuid('storefront_id'),
  price: doublePrecision('price').notNull(),
  discountPrice: doublePrecision('discount_price'),
  currency: text('currency').default('USD').notNull(),
  categoryId: uuid('category_id').references(() => categories.id),
  isCustomizable: boolean('is_customizable').default(false).notNull(),
  isPublished: boolean('is_published').default(false).notNull(),
  dimensions: text('dimensions'), // e.g. "10x20x30 cm"
  weight: doublePrecision('weight'),
  weightUnit: text('weight_unit').default('kg'),
  material: text('material'),
  color: text('color'),
  leadTime: integer('lead_time'), // days to produce
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const productImages = pgTable('product_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  imageUrl: text('image_url').notNull(),
  altText: text('alt_text'),
  displayOrder: integer('display_order').default(0).notNull(),
  isMain: boolean('is_main').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const productAttributes = pgTable('product_attributes', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  attributeId: uuid('attribute_id').notNull().references(() => attributes.id, { onDelete: 'cascade' }),
  value: text('value').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const inventory = pgTable('inventory', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').notNull().default(0),
  reservedQuantity: integer('reserved_quantity').notNull().default(0),
  sku: text('sku').unique(),
  lowStockThreshold: integer('low_stock_threshold').default(5),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}); 