/**
 * Database Server Actions
 * 
 * This file contains server actions for interacting with the database.
 * These functions are designed to be used with Next.js Server Actions.
 */
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from './index';
import * as schema from './schema';
import { and, eq } from 'drizzle-orm';
import { createClient } from '../supabase/server';
import { getUser } from '../supabase/server';

/**
 * Get the full user profile including their role-specific profile
 */
export async function getUserProfile(userId?: string) {
  try {
    // If no user ID provided, get the current logged-in user
    if (!userId) {
      const currentUser = await getUser();
      if (!currentUser) {
        return null;
      }
      
      // Look up user by auth ID
      const users = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.authId, currentUser.id))
        .limit(1);
      
      if (!users.length) {
        return null;
      }
      
      userId = users[0].id;
    }
    
    // Get user data
    const users = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);
    
    if (!users.length) {
      return null;
    }
    
    const user = users[0];
    let profile = null;
    
    // Get role-specific profile
    if (user.userRole === 'craftsman') {
      const profiles = await db
        .select()
        .from(schema.craftsmanProfiles)
        .where(eq(schema.craftsmanProfiles.userId, userId))
        .limit(1);
      
      if (profiles.length) {
        profile = profiles[0];
      }
    } else if (user.userRole === 'builder') {
      const profiles = await db
        .select()
        .from(schema.builderProfiles)
        .where(eq(schema.builderProfiles.userId, userId))
        .limit(1);
      
      if (profiles.length) {
        profile = profiles[0];
      }
    }
    
    return {
      user,
      profile
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

/**
 * Update user data
 */
export async function updateUser(userId: string, data: Partial<typeof schema.users.$inferInsert>) {
  try {
    // Ensure user exists
    const users = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);
    
    if (!users.length) {
      return { success: false, message: 'User not found' };
    }
    
    // Update user
    await db
      .update(schema.users)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(schema.users.id, userId));
    
    revalidatePath('/profile');
    revalidatePath(`/users/${userId}`);
    
    return { success: true };
  } catch (error) {
    console.error('Error updating user:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Update craftsman profile
 */
export async function updateCraftsmanProfile(profileId: string, data: Partial<typeof schema.craftsmanProfiles.$inferInsert>) {
  try {
    // Ensure profile exists
    const profiles = await db
      .select({ id: schema.craftsmanProfiles.id })
      .from(schema.craftsmanProfiles)
      .where(eq(schema.craftsmanProfiles.id, profileId))
      .limit(1);
    
    if (!profiles.length) {
      return { success: false, message: 'Profile not found' };
    }
    
    // Update profile
    await db
      .update(schema.craftsmanProfiles)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(schema.craftsmanProfiles.id, profileId));
    
    revalidatePath('/profile');
    revalidatePath('/profile/edit');
    
    return { success: true };
  } catch (error) {
    console.error('Error updating craftsman profile:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Update builder profile
 */
export async function updateBuilderProfile(profileId: string, data: Partial<typeof schema.builderProfiles.$inferInsert>) {
  try {
    // Ensure profile exists
    const profiles = await db
      .select({ id: schema.builderProfiles.id })
      .from(schema.builderProfiles)
      .where(eq(schema.builderProfiles.id, profileId))
      .limit(1);
    
    if (!profiles.length) {
      return { success: false, message: 'Profile not found' };
    }
    
    // Update profile
    await db
      .update(schema.builderProfiles)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(schema.builderProfiles.id, profileId));
    
    revalidatePath('/profile');
    revalidatePath('/profile/edit');
    
    return { success: true };
  } catch (error) {
    console.error('Error updating builder profile:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Create/sync a user in our database after Supabase auth registration
 */
export async function syncUserAfterAuth(
  authId: string,
  email: string,
  fullName: string,
  userRole?: string,
  redirectTo?: string
) {
  try {
    const supabase = createClient();
    
    // Check if user already exists in our database
    const existingUsers = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.authId, authId))
      .limit(1);
    
    if (existingUsers.length) {
      // User exists, update if needed
      if (existingUsers[0].email !== email || existingUsers[0].fullName !== fullName) {
        await db
          .update(schema.users)
          .set({
            email,
            fullName,
            updatedAt: new Date()
          })
          .where(eq(schema.users.id, existingUsers[0].id));
      }
      
      if (redirectTo) {
        redirect(redirectTo);
      }
      
      return { success: true, userId: existingUsers[0].id };
    }
    
    // Create new user
    const result = await db
      .insert(schema.users)
      .values({
        authId,
        email,
        fullName,
        userRole: userRole || 'builder', // Default role
        isOnboarded: false
      })
      .returning();
    
    if (!result.length) {
      throw new Error('Failed to create user');
    }
    
    if (redirectTo) {
      redirect(redirectTo);
    }
    
    return { success: true, userId: result[0].id };
  } catch (error) {
    console.error('Error syncing user after auth:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
} 