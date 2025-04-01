'use server';

import { db } from '@/lib/db';
import { storefronts, storefrontCustomization, products, productImages } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { StorefrontWithCustomization } from './types';

/**
 * Retrieves a storefront by ID including its customization settings
 */
export async function getStorefrontWithCustomization(storefrontId: string): Promise<StorefrontWithCustomization | null> {
  const [result] = await db
    .select()
    .from(storefronts)
    .where(eq(storefronts.id, storefrontId))
    .limit(1);

  if (!result) {
    return null;
  }

  // Get customization
  const [customization] = await db
    .select()
    .from(storefrontCustomization)
    .where(eq(storefrontCustomization.storefrontId, storefrontId))
    .limit(1);

  return {
    ...result,
    customization: customization || undefined,
  };
}

/**
 * Retrieves all storefronts for a user
 */
export async function getUserStorefronts(userId: string) {
  return db
    .select()
    .from(storefronts)
    .where(eq(storefronts.userId, userId))
    .orderBy(desc(storefronts.updatedAt));
}

/**
 * Retrieves a storefront by slug for public viewing
 */
export async function getStorefrontBySlug(slug: string): Promise<StorefrontWithCustomization | null> {
  const [result] = await db
    .select()
    .from(storefronts)
    .where(eq(storefronts.slug, slug))
    .limit(1);

  if (!result) {
    return null;
  }

  // Get customization
  const [customization] = await db
    .select()
    .from(storefrontCustomization)
    .where(eq(storefrontCustomization.storefrontId, result.id))
    .limit(1);

  return {
    ...result,
    customization: customization || undefined,
  };
}

/**
 * Retrieves products for a specific storefront
 */
export async function getStorefrontProducts(storefrontId: string) {
  const productsData = await db
    .select({
      id: products.id,
      name: products.name,
      price: products.price,
      slug: products.slug,
    })
    .from(products)
    .where(eq(products.storefrontId, storefrontId))
    .limit(6);

  // Get main image for each product
  const productsWithImages = await Promise.all(
    productsData.map(async (product) => {
      const [mainImage] = await db
        .select({ imageUrl: productImages.imageUrl })
        .from(productImages)
        .where(
          and(
            eq(productImages.productId, product.id),
            eq(productImages.isMain, true)
          )
        )
        .limit(1);

      return {
        ...product,
        imageUrl: mainImage?.imageUrl,
      };
    })
  );

  return productsWithImages;
}

/**
 * Retrieves featured storefronts for the marketplace homepage
 */
export async function getFeaturedStorefronts(limit = 4) {
  // In a real app, you'd have some criteria for featuring storefronts
  // For now, we'll just get the most recently updated ones
  return db
    .select()
    .from(storefronts)
    .orderBy(desc(storefronts.updatedAt))
    .limit(limit);
} 