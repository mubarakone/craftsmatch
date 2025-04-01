'use server';

import { getSession as getSupabaseSession } from '../supabase/server';

// Don't re-export from server.ts in a 'use server' file
// export { getSession as getSupabaseSession } from '../supabase/server';

/**
 * Gets the current user session from Supabase Auth
 */
export async function getSession() {
  return getSupabaseSession();
}

/**
 * Require authentication - this function will throw an error if user is not authenticated
 */
export async function requireAuth() {
  const session = await getSession();
  
  if (!session) {
    throw new Error('Authentication required');
  }
  
  return {
    user: session.user,
    session
  };
}

// Comment out this function until fixed
/*
export async function getUserDetails() {
  const session = await getSession();
  
  if (!session) {
    return null;
  }
  
  // This needs to be fixed - we can't use getSupabaseSession this way
  // TODO: Fix this function
  return null;
}
*/ 