import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";
import { products } from "./products";

export const storefronts = pgTable("storefronts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  slug: text("slug").notNull().unique(),
  logoUrl: text("logo_url"),
  bannerUrl: text("banner_url"),
  location: text("location"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const storefrontsRelations = relations(storefronts, ({ one, many }) => ({
  user: one(users, {
    fields: [storefronts.userId],
    references: [users.id],
  }),
  products: many(products),
  customization: one(storefrontCustomization),
}));

export const storefrontCustomization = pgTable("storefront_customization", {
  id: uuid("id").defaultRandom().primaryKey(),
  storefrontId: uuid("storefront_id").references(() => storefronts.id, { onDelete: "cascade" }).notNull().unique(),
  primaryColor: text("primary_color").default("#4f46e5"),
  secondaryColor: text("secondary_color").default("#f43f5e"),
  accentColor: text("accent_color").default("#10b981"),
  fontFamily: text("font_family").default("Inter"),
  headerLayout: text("header_layout").default("standard"),
  productCardStyle: text("product_card_style").default("standard"),
  customCss: text("custom_css"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const storefrontCustomizationRelations = relations(storefrontCustomization, ({ one }) => ({
  storefront: one(storefronts, {
    fields: [storefrontCustomization.storefrontId],
    references: [storefronts.id],
  }),
})); 