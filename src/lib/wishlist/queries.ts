'use server';

import { db } from '@/lib/db';
import { wishlists, wishlistItems, products, productImages } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getUser } from '@/lib/supabase/server';

/**
 * Get user's wishlists
 */
export async function getUserWishlists() {
  try {
    const user = await getUser();
    if (!user) {
      return [];
    }

    const userWishlists = await db
      .select({
        id: wishlists.id,
        name: wishlists.name,
        isDefault: wishlists.isDefault,
        itemCount: db.fn.count(wishlistItems.id).as('itemCount'),
        createdAt: wishlists.createdAt,
        updatedAt: wishlists.updatedAt
      })
      .from(wishlists)
      .leftJoin(wishlistItems, eq(wishlists.id, wishlistItems.wishlistId))
      .where(eq(wishlists.userId, user.id))
      .groupBy(wishlists.id)
      .orderBy(desc(wishlists.createdAt));

    return userWishlists;
  } catch (error) {
    console.error('Error fetching user wishlists:', error);
    return [];
  }
}

/**
 * Get a wishlist by ID with all items
 */
export async function getWishlistById(wishlistId: string) {
  try {
    const user = await getUser();
    if (!user) {
      return null;
    }

    // Get the wishlist
    const [wishlist] = await db
      .select({
        id: wishlists.id,
        name: wishlists.name,
        isDefault: wishlists.isDefault,
        userId: wishlists.userId,
        createdAt: wishlists.createdAt,
        updatedAt: wishlists.updatedAt
      })
      .from(wishlists)
      .where(and(
        eq(wishlists.id, wishlistId),
        eq(wishlists.userId, user.id)
      ))
      .limit(1);

    if (!wishlist) {
      return null;
    }

    // Get the wishlist items with product details
    const items = await db
      .select({
        id: wishlistItems.id,
        addedAt: wishlistItems.createdAt,
        notes: wishlistItems.notes,
        productId: products.id,
        productName: products.name,
        productSlug: products.slug,
        productPrice: products.price,
        productDiscountPrice: products.discountPrice,
        imageUrl: productImages.imageUrl,
        storefront: {
          id: products.storefrontId,
          name: db.raw('storefronts.name'), // Join in actual query
        }
      })
      .from(wishlistItems)
      .innerJoin(products, eq(wishlistItems.productId, products.id))
      .leftJoin(productImages, and(
        eq(productImages.productId, products.id),
        eq(productImages.isMain, true)
      ))
      .where(eq(wishlistItems.wishlistId, wishlistId))
      .orderBy(desc(wishlistItems.createdAt));

    return {
      ...wishlist,
      items
    };
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return null;
  }
}

/**
 * Get user's default wishlist
 */
export async function getDefaultWishlist() {
  try {
    const user = await getUser();
    if (!user) {
      return null;
    }

    // Get the user's default wishlist
    const [defaultWishlist] = await db
      .select({
        id: wishlists.id,
        name: wishlists.name,
        isDefault: wishlists.isDefault,
        userId: wishlists.userId,
        createdAt: wishlists.createdAt,
        updatedAt: wishlists.updatedAt
      })
      .from(wishlists)
      .where(and(
        eq(wishlists.userId, user.id),
        eq(wishlists.isDefault, true)
      ))
      .limit(1);

    if (!defaultWishlist) {
      return null;
    }

    // Get the wishlist items with product details
    const items = await db
      .select({
        id: wishlistItems.id,
        addedAt: wishlistItems.createdAt,
        notes: wishlistItems.notes,
        productId: products.id,
        productName: products.name,
        productSlug: products.slug,
        productPrice: products.price,
        productDiscountPrice: products.discountPrice,
        imageUrl: productImages.imageUrl
      })
      .from(wishlistItems)
      .innerJoin(products, eq(wishlistItems.productId, products.id))
      .leftJoin(productImages, and(
        eq(productImages.productId, products.id),
        eq(productImages.isMain, true)
      ))
      .where(eq(wishlistItems.wishlistId, defaultWishlist.id))
      .orderBy(desc(wishlistItems.createdAt));

    return {
      ...defaultWishlist,
      items
    };
  } catch (error) {
    console.error('Error fetching default wishlist:', error);
    return null;
  }
}

/**
 * Check if a product is in any of the user's wishlists
 */
export async function isProductInWishlist(productId: string) {
  try {
    const user = await getUser();
    if (!user) {
      return { inWishlist: false };
    }

    // Find wishlist items for this product in any of the user's wishlists
    const [result] = await db
      .select({
        count: db.fn.count()
      })
      .from(wishlistItems)
      .innerJoin(wishlists, eq(wishlistItems.wishlistId, wishlists.id))
      .where(and(
        eq(wishlistItems.productId, productId),
        eq(wishlists.userId, user.id)
      ))
      .limit(1) as [{ count: number }];

    // Find which wishlist contains the product (if any)
    if (Number(result.count) > 0) {
      const [item] = await db
        .select({
          wishlistId: wishlistItems.wishlistId,
          wishlistName: wishlists.name
        })
        .from(wishlistItems)
        .innerJoin(wishlists, eq(wishlistItems.wishlistId, wishlists.id))
        .where(and(
          eq(wishlistItems.productId, productId),
          eq(wishlists.userId, user.id)
        ))
        .limit(1);

      return { 
        inWishlist: true, 
        wishlistId: item.wishlistId,
        wishlistName: item.wishlistName
      };
    }

    return { inWishlist: false };
  } catch (error) {
    console.error('Error checking if product is in wishlist:', error);
    return { inWishlist: false };
  }
} 