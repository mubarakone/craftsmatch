/* eslint-disable @typescript-eslint/no-unused-vars */
// This file will export all schemas
// For now it's just a placeholder until we implement the actual schemas in step 4

// Export all schema tables
export * from './users';
export * from './craftsman-profiles';
export * from './builder-profiles';
export * from './categories';
export * from './attributes';
export * from './products';
export * from './orders';
export * from './transactions';
export * from './messages';
export * from './reviews';

// Import relations
import { users } from './users';
import { craftsmanProfiles } from './craftsman-profiles';
import { builderProfiles } from './builder-profiles';
import { categories } from './categories';
import { attributes } from './attributes';
import { products, productImages, productAttributes, inventory } from './products';
import { orders, orderItems, shipping, samples, revisions } from './orders';
import { transactions } from './transactions';
import { conversations, messages, attachments } from './messages';
import { reviews } from './reviews';
import { relations } from 'drizzle-orm';

// Define relationships that require circular references

// Users relations
export const usersRelations = relations(users, ({ one }) => ({
  craftsmanProfile: one(craftsmanProfiles, {
    fields: [users.id],
    references: [craftsmanProfiles.userId],
  }),
  builderProfile: one(builderProfiles, {
    fields: [users.id],
    references: [builderProfiles.userId],
  }),
}));

// Categories relations
export const categoriesRelations = relations(categories, ({ many, one }) => ({
  products: many(products),
  subcategories: many(categories, {
    relationName: 'subcategories',
  }),
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: 'subcategories',
  }),
  attributes: many(attributes),
}));

// Attributes relations
export const attributesRelations = relations(attributes, ({ one, many }) => ({
  category: one(categories, {
    fields: [attributes.categoryId],
    references: [categories.id],
  }),
  productAttributes: many(productAttributes),
}));

// Products relations
export const productsRelations = relations(products, ({ one, many }) => ({
  craftsman: one(users, {
    fields: [products.craftmanId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  images: many(productImages),
  attributes: many(productAttributes),
  inventoryItem: one(inventory, {
    fields: [products.id],
    references: [inventory.productId],
  }),
}));

// ProductAttributes relations
export const productAttributesRelations = relations(productAttributes, ({ one }) => ({
  product: one(products, {
    fields: [productAttributes.productId],
    references: [products.id],
  }),
  attribute: one(attributes, {
    fields: [productAttributes.attributeId],
    references: [attributes.id],
  }),
}));

// ProductImages relations
export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

// Inventory relations
export const inventoryRelations = relations(inventory, ({ one }) => ({
  product: one(products, {
    fields: [inventory.productId],
    references: [products.id],
  }),
}));

// Orders relations
export const ordersRelations = relations(orders, ({ one, many }) => ({
  buyer: one(users, {
    fields: [orders.buyerId],
    references: [users.id],
  }),
  seller: one(users, {
    fields: [orders.sellerId],
    references: [users.id],
  }),
  items: many(orderItems),
  shippingDetails: one(shipping, {
    fields: [orders.id],
    references: [shipping.orderId],
  }),
  revisionRequests: many(revisions),
}));

// OrderItems relations
export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

// Shipping relations
export const shippingRelations = relations(shipping, ({ one }) => ({
  order: one(orders, {
    fields: [shipping.orderId],
    references: [orders.id],
  }),
}));

// Samples relations
export const samplesRelations = relations(samples, ({ one }) => ({
  product: one(products, {
    fields: [samples.productId],
    references: [products.id],
  }),
  buyer: one(users, {
    fields: [samples.buyerId],
    references: [users.id],
  }),
  seller: one(users, {
    fields: [samples.sellerId],
    references: [users.id],
  }),
  shipping: one(shipping, {
    fields: [samples.shippingId],
    references: [shipping.id],
  }),
}));

// Revisions relations
export const revisionsRelations = relations(revisions, ({ one }) => ({
  order: one(orders, {
    fields: [revisions.orderId],
    references: [orders.id],
  }),
  requester: one(users, {
    fields: [revisions.requestedBy],
    references: [users.id],
  }),
}));

// Transactions relations
export const transactionsRelations = relations(transactions, ({ one }) => ({
  order: one(orders, {
    fields: [transactions.orderId],
    references: [orders.id],
  }),
  buyer: one(users, {
    fields: [transactions.buyerId],
    references: [users.id],
  }),
  seller: one(users, {
    fields: [transactions.sellerId],
    references: [users.id],
  }),
}));

// Conversations relations
export const conversationsRelations = relations(conversations, ({ many, one }) => ({
  messages: many(messages),
  lastMessage: one(messages, {
    fields: [conversations.lastMessageId],
    references: [messages.id],
  }),
}));

// Messages relations
export const messagesRelations = relations(messages, ({ one, many }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
  attachments: many(attachments),
}));

// Attachments relations
export const attachmentsRelations = relations(attachments, ({ one }) => ({
  message: one(messages, {
    fields: [attachments.messageId],
    references: [messages.id],
  }),
}));

// Reviews relations
export const reviewsRelations = relations(reviews, ({ one }) => ({
  reviewer: one(users, {
    fields: [reviews.reviewerId],
    references: [users.id],
  }),
  reviewee: one(users, {
    fields: [reviews.revieweeId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  order: one(orders, {
    fields: [reviews.orderId],
    references: [orders.id],
  }),
})); 