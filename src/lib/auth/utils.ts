'use server';

// Import directly from server instead of using relative path
import { getSession } from '@/lib/supabase/server';

/**
 * Utility function to check if a user is authenticated
 * @returns Promise<boolean> True if user is authenticated, false otherwise
 */
export async function isAuthenticated() {
  const session = await getSession();
  return !!session?.user;
}

/**
 * Get current user ID
 * @returns Promise<string | null> User ID if authenticated, null otherwise
 */
export async function getCurrentUserId() {
  const session = await getSession();
  return session?.user?.id || null;
}

/**
 * Check if current user has a specific role
 * @param role The role to check for
 * @returns Promise<boolean> True if user has the role, false otherwise
 */
export const hasRole = async (role: string): Promise<boolean> => {
  const session = await getSession();
  if (!session?.user) return false;
  
  // This assumes role information is stored in user metadata
  // Adjust based on your actual user data structure
  const userRole = (session.user.user_metadata as any)?.role;
  return userRole === role;
};

/**
 * Check if the user can access a storefront
 * This is a placeholder function that always returns true for authenticated users
 */
export async function canAccessStorefront(storefrontId) {
  const isAuth = await isAuthenticated();
  return isAuth;
}

/**
 * Auth utility that checks authentication and returns user data
 * Used in various places that import auth from this file
 */
export async function auth() {
  const session = await getSession();
  if (!session) {
    throw new Error('Authentication required');
  }
  return {
    user: session.user,
    userId: session.user.id
  };
} 