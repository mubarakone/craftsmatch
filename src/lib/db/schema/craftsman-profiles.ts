import { pgTable, text, uuid, timestamp, jsonb, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

export const craftsmanProfiles = pgTable('craftsman_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  businessName: text('business_name').notNull(),
  description: text('description'),
  specialty: text('specialty').notNull(),
  experience: integer('experience_years'),
  location: text('location').notNull(),
  website: text('website'),
  phoneNumber: text('phone_number'),
  socialLinks: jsonb('social_links').$type<{
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
  }>(),
  certifications: jsonb('certifications').$type<string[]>(),
  portfolioImages: jsonb('portfolio_images').$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const craftsmanProfilesRelations = relations(craftsmanProfiles, ({ one }) => ({
  user: one(users, {
    fields: [craftsmanProfiles.userId],
    references: [users.id],
  }),
})); 