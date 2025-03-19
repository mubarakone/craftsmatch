import { pgTable, text, uuid, timestamp, doublePrecision, jsonb } from 'drizzle-orm/pg-core';
import { orders } from './orders';
import { users } from './users';

export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  transactionId: text('transaction_id').unique().notNull(),
  orderId: uuid('order_id').references(() => orders.id),
  buyerId: uuid('buyer_id').notNull().references(() => users.id),
  sellerId: uuid('seller_id').notNull().references(() => users.id),
  amount: doublePrecision('amount').notNull(),
  currency: text('currency').default('USD').notNull(),
  status: text('status', {
    enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled']
  }).notNull().default('pending'),
  paymentMethod: text('payment_method').notNull(),
  paymentDetails: jsonb('payment_details'),
  // Placeholder for blockchain transaction details
  blockchainTxHash: text('blockchain_tx_hash'),
  blockchainNetwork: text('blockchain_network'),
  walletAddress: text('wallet_address'),
  platformFee: doublePrecision('platform_fee'),
  sellerPayout: doublePrecision('seller_payout'),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}); 