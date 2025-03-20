import { pgTable, text, uuid, timestamp, boolean, integer, doublePrecision, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users';
import { products } from './products';

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderNumber: text('order_number').unique().notNull(),
  buyerId: uuid('buyer_id').notNull().references(() => users.id),
  sellerId: uuid('seller_id').notNull().references(() => users.id),
  status: text('status', {
    enum: ['pending', 'processing', 'completed', 'cancelled', 'refunded', 'in_revision']
  }).notNull().default('pending'),
  totalPrice: doublePrecision('total_price').notNull(),
  currency: text('currency').default('USD').notNull(),
  shipping: doublePrecision('shipping'),
  tax: doublePrecision('tax'),
  notes: text('notes'),
  isCustomOrder: boolean('is_custom_order').default(false).notNull(),
  customRequirements: text('custom_requirements'),
  estimatedDeliveryDate: timestamp('estimated_delivery_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').notNull().references(() => products.id),
  quantity: integer('quantity').notNull().default(1),
  unitPrice: doublePrecision('unit_price').notNull(),
  customizations: jsonb('customizations'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const shipping = pgTable('shipping', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }).unique(),
  recipientName: text('recipient_name').notNull(),
  addressLine1: text('address_line1').notNull(),
  addressLine2: text('address_line2'),
  city: text('city').notNull(),
  state: text('state').notNull(),
  zipCode: text('zip_code').notNull(),
  country: text('country').notNull(),
  phoneNumber: text('phone_number'),
  trackingNumber: text('tracking_number'),
  shippingCarrier: text('shipping_carrier'),
  shippingMethod: text('shipping_method'),
  shippingStatus: text('shipping_status', {
    enum: ['pending', 'processing', 'shipped', 'delivered', 'returned']
  }).default('pending').notNull(),
  estimatedDeliveryDate: timestamp('estimated_delivery_date'),
  actualDeliveryDate: timestamp('actual_delivery_date'),
  specialInstructions: text('special_instructions'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const samples = pgTable('samples', {
  id: uuid('id').primaryKey().defaultRandom(),
  requestNumber: text('request_number').unique().notNull(),
  productId: uuid('product_id').notNull().references(() => products.id),
  buyerId: uuid('buyer_id').notNull().references(() => users.id),
  sellerId: uuid('seller_id').notNull().references(() => users.id),
  status: text('status', {
    enum: ['requested', 'approved', 'rejected', 'shipped', 'delivered']
  }).notNull().default('requested'),
  requestReason: text('request_reason').notNull(),
  sellerNotes: text('seller_notes'),
  shippingId: uuid('shipping_id').references(() => shipping.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const revisions = pgTable('revisions', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  requestedBy: uuid('requested_by').notNull().references(() => users.id),
  status: text('status', {
    enum: ['requested', 'in_progress', 'completed', 'rejected']
  }).notNull().default('requested'),
  description: text('description').notNull(),
  attachments: jsonb('attachments').$type<string[]>(),
  responseNotes: text('response_notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}); 