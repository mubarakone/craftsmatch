import { pgTable, text, uuid, timestamp, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Import forward references for relations
import type { craftsmanProfiles } from './craftsman-profiles';
import type { builderProfiles } from './builder-profiles';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  authId: text('auth_id').unique().notNull(), // Supabase auth ID
  email: text('email').unique().notNull(),
  fullName: text('full_name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  isOnboarded: boolean('is_onboarded').default(false).notNull(),
  userRole: text('user_role', { enum: ['craftsman', 'builder', 'admin'] }).notNull(),
  avatarUrl: text('avatar_url'),
});

// We'll define the relations after both related tables are defined to avoid circular dependencies
// This will be properly initialized in the index.ts file 