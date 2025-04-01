import { storefronts, storefrontCustomization } from "@/lib/db/schema";
import { InferSelectModel } from "drizzle-orm";

export type Storefront = InferSelectModel<typeof storefronts>;
export type StorefrontCustomization = InferSelectModel<typeof storefrontCustomization>;

export interface StorefrontWithCustomization extends Storefront {
  customization?: StorefrontCustomization;
} 