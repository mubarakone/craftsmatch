import { pgTable, text, uuid, timestamp, integer, doublePrecision, boolean } from 'drizzle-orm/pg-core';
import { products } from './products';
import { relations } from 'drizzle-orm';

export const customizationOptions = pgTable('customization_options', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(), // 'color', 'material', 'size', 'text', 'custom'
  required: boolean('required').default(false).notNull(),
  additionalCost: doublePrecision('additional_cost').default(0).notNull(),
  displayOrder: integer('display_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const customizationOptionChoices = pgTable('customization_option_choices', {
  id: uuid('id').primaryKey().defaultRandom(),
  optionId: uuid('option_id').notNull().references(() => customizationOptions.id, { onDelete: 'cascade' }),
  value: text('value').notNull(),
  label: text('label').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  additionalCost: doublePrecision('additional_cost').default(0).notNull(),
  displayOrder: integer('display_order').default(0).notNull(),
  isDefault: boolean('is_default').default(false).notNull(),
  available: boolean('available').default(true).notNull(),
  metadata: text('metadata'), // JSON string for additional properties
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const customizationOptionsRelations = relations(customizationOptions, ({ one, many }) => ({
  product: one(products, {
    fields: [customizationOptions.productId],
    references: [products.id],
  }),
  choices: many(customizationOptionChoices),
}));

export const customizationOptionChoicesRelations = relations(customizationOptionChoices, ({ one }) => ({
  option: one(customizationOptions, {
    fields: [customizationOptionChoices.optionId],
    references: [customizationOptions.id],
  }),
})); 