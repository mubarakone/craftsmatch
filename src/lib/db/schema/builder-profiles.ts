import { pgTable, text, uuid, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

export const builderProfiles = pgTable('builder_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  companyName: text('company_name'),
  description: text('description'),
  industry: text('industry').notNull(),
  location: text('location').notNull(),
  website: text('website'),
  phoneNumber: text('phone_number'),
  isCommercial: boolean('is_commercial').default(false).notNull(),
  projectTypes: jsonb('project_types').$type<string[]>(),
  preferredMaterials: jsonb('preferred_materials').$type<string[]>(),
  socialLinks: jsonb('social_links').$type<{
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const builderProfilesRelations = relations(builderProfiles, ({ one }) => ({
  user: one(users, {
    fields: [builderProfiles.userId],
    references: [users.id],
  }),
})); 