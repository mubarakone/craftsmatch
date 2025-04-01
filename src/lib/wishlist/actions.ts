'use server';

import { db } from '@/lib/db';
import { wishlists, wishlistItems } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getUser } from '@/lib/supabase/server';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

// Validation schemas
const wishlistSchema = z.object({
  name: z.string().min(1).max(50),
  isDefault: z.boolean().optional()
});

const wishlistItemSchema = z.object({
  productId: z.string().uuid(),
  wishlistId: z.string().uuid(),
  notes: z.string().max(500).optional()
});

/**
 * Create a new wishlist
 */
export async function createWishlist(data: { name: string, isDefault?: boolean }) {
  try {
    const user = await getUser();
    if (!user) {
      throw new Error('You must be logged in to create a wishlist');
    }

    // Validate input data
    const validated = wishlistSchema.parse(data);

    // If this is set as default, update any other default wishlist
    if (validated.isDefault) {
      await db
        .update(wishlists)
        .set({ isDefault: false })
        .where(and(
          eq(wishlists.userId, user.id),
          eq(wishlists.isDefault, true)
        ));
    }

    // Create the new wishlist
    const [newWishlist] = await db
      .insert(wishlists)
      .values({
        id: uuidv4(),
        name: validated.name,
        userId: user.id,
        isDefault: validated.isDefault ?? false,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    return { success: true, wishlist: newWishlist };
  } catch (error) {
    console.error('Error creating wishlist:', error);
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'Invalid wishlist data', 
        details: error.errors 
      };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to create wishlist' };
  }
}

/**
 * Update an existing wishlist
 */
export async function updateWishlist(wishlistId: string, data: { name?: string, isDefault?: boolean }) {
  try {
    const user = await getUser();
    if (!user) {
      throw new Error('You must be logged in to update a wishlist');
    }

    // Verify ownership
    const [existingWishlist] = await db
      .select()
      .from(wishlists)
      .where(and(
        eq(wishlists.id, wishlistId),
        eq(wishlists.userId, user.id)
      ))
      .limit(1);

    if (!existingWishlist) {
      throw new Error('Wishlist not found or you do not have permission to update it');
    }

    // If setting as default, update other default wishlists
    if (data.isDefault) {
      await db
        .update(wishlists)
        .set({ isDefault: false })
        .where(and(
          eq(wishlists.userId, user.id),
          eq(wishlists.isDefault, true),
          eq(wishlists.id, wishlistId).not()
        ));
    }

    // Update the wishlist
    const [updatedWishlist] = await db
      .update(wishlists)
      .set({
        name: data.name ?? existingWishlist.name,
        isDefault: data.isDefault ?? existingWishlist.isDefault,
        updatedAt: new Date()
      })
      .where(eq(wishlists.id, wishlistId))
      .returning();

    return { success: true, wishlist: updatedWishlist };
  } catch (error) {
    console.error('Error updating wishlist:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to update wishlist' };
  }
}

/**
 * Delete a wishlist
 */
export async function deleteWishlist(wishlistId: string) {
  try {
    const user = await getUser();
    if (!user) {
      throw new Error('You must be logged in to delete a wishlist');
    }

    // Verify ownership
    const [wishlist] = await db
      .select()
      .from(wishlists)
      .where(and(
        eq(wishlists.id, wishlistId),
        eq(wishlists.userId, user.id)
      ))
      .limit(1);

    if (!wishlist) {
      throw new Error('Wishlist not found or you do not have permission to delete it');
    }

    // Check if this is the default wishlist
    if (wishlist.isDefault) {
      // Find another wishlist to set as default
      const [anotherWishlist] = await db
        .select()
        .from(wishlists)
        .where(and(
          eq(wishlists.userId, user.id),
          eq(wishlists.id, wishlistId).not()
        ))
        .limit(1);

      if (anotherWishlist) {
        await db
          .update(wishlists)
          .set({ isDefault: true })
          .where(eq(wishlists.id, anotherWishlist.id));
      }
    }

    // Delete all wishlist items first
    await db
      .delete(wishlistItems)
      .where(eq(wishlistItems.wishlistId, wishlistId));

    // Delete the wishlist
    await db
      .delete(wishlists)
      .where(eq(wishlists.id, wishlistId));

    return { success: true };
  } catch (error) {
    console.error('Error deleting wishlist:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to delete wishlist' };
  }
}

/**
 * Add an item to a wishlist
 */
export async function addToWishlist(data: { productId: string, wishlistId?: string, notes?: string }) {
  try {
    const user = await getUser();
    if (!user) {
      throw new Error('You must be logged in to add items to a wishlist');
    }

    let wishlistId = data.wishlistId;

    // If no wishlist specified, use default or create one
    if (!wishlistId) {
      // Find default wishlist
      const [defaultWishlist] = await db
        .select()
        .from(wishlists)
        .where(and(
          eq(wishlists.userId, user.id),
          eq(wishlists.isDefault, true)
        ))
        .limit(1);

      if (defaultWishlist) {
        wishlistId = defaultWishlist.id;
      } else {
        // Create a default wishlist
        const result = await createWishlist({ 
          name: 'My Wishlist', 
          isDefault: true 
        });
        
        if (!result.success || !result.wishlist) {
          throw new Error('Failed to create default wishlist');
        }
        
        wishlistId = result.wishlist.id;
      }
    } else {
      // Verify wishlist ownership
      const [wishlist] = await db
        .select()
        .from(wishlists)
        .where(and(
          eq(wishlists.id, wishlistId),
          eq(wishlists.userId, user.id)
        ))
        .limit(1);

      if (!wishlist) {
        throw new Error('Wishlist not found or you do not have permission to add items to it');
      }
    }

    // Check if the item is already in the wishlist
    const [existingItem] = await db
      .select()
      .from(wishlistItems)
      .where(and(
        eq(wishlistItems.wishlistId, wishlistId),
        eq(wishlistItems.productId, data.productId)
      ))
      .limit(1);

    if (existingItem) {
      // Update notes if provided
      if (data.notes !== undefined) {
        await db
          .update(wishlistItems)
          .set({ 
            notes: data.notes,
            updatedAt: new Date()
          })
          .where(eq(wishlistItems.id, existingItem.id));
      }
      
      return { 
        success: true, 
        message: 'Item is already in your wishlist',
        wishlistId
      };
    }

    // Add the new item
    const [newItem] = await db
      .insert(wishlistItems)
      .values({
        id: uuidv4(),
        wishlistId: wishlistId,
        productId: data.productId,
        notes: data.notes || null,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    return { 
      success: true, 
      item: newItem, 
      wishlistId 
    };
  } catch (error) {
    console.error('Error adding item to wishlist:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to add item to wishlist' };
  }
}

/**
 * Remove an item from a wishlist
 */
export async function removeFromWishlist(itemId: string) {
  try {
    const user = await getUser();
    if (!user) {
      throw new Error('You must be logged in to remove items from a wishlist');
    }

    // Verify ownership through wishlist
    const [item] = await db
      .select({
        id: wishlistItems.id,
        wishlistId: wishlistItems.wishlistId,
        userId: wishlists.userId
      })
      .from(wishlistItems)
      .innerJoin(wishlists, eq(wishlistItems.wishlistId, wishlists.id))
      .where(eq(wishlistItems.id, itemId))
      .limit(1);

    if (!item) {
      throw new Error('Wishlist item not found');
    }

    if (item.userId !== user.id) {
      throw new Error('You do not have permission to remove this item');
    }

    // Delete the item
    await db
      .delete(wishlistItems)
      .where(eq(wishlistItems.id, itemId));

    return { success: true };
  } catch (error) {
    console.error('Error removing item from wishlist:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to remove item from wishlist' };
  }
}

/**
 * Update wishlist item notes
 */
export async function updateWishlistItemNotes(itemId: string, notes: string) {
  try {
    const user = await getUser();
    if (!user) {
      throw new Error('You must be logged in to update wishlist items');
    }

    // Verify ownership through wishlist
    const [item] = await db
      .select({
        id: wishlistItems.id,
        wishlistId: wishlistItems.wishlistId,
        userId: wishlists.userId
      })
      .from(wishlistItems)
      .innerJoin(wishlists, eq(wishlistItems.wishlistId, wishlists.id))
      .where(eq(wishlistItems.id, itemId))
      .limit(1);

    if (!item) {
      throw new Error('Wishlist item not found');
    }

    if (item.userId !== user.id) {
      throw new Error('You do not have permission to update this item');
    }

    // Update the notes
    await db
      .update(wishlistItems)
      .set({ 
        notes,
        updatedAt: new Date()
      })
      .where(eq(wishlistItems.id, itemId));

    return { success: true };
  } catch (error) {
    console.error('Error updating wishlist item notes:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to update wishlist item notes' };
  }
} 