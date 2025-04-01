"use server";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from 'next/cache';
import { syncUserAfterAuth } from '../db/actions';

/**
 * Sign in with email and password
 */
export async function signIn(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  
  if (!email || !password) {
    return {
      success: false,
      error: 'Email and password are required'
    };
  }
  
  const supabase = createClient();
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) {
    return {
      success: false,
      error: error.message
    };
  }
  
  // Sync with our database
  if (data.user) {
    await syncUserAfterAuth(
      data.user.id,
      data.user.email || email,
      data.user.user_metadata?.full_name || email.split('@')[0]
    );
  }
  
  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

/**
 * Sign up with email and password
 */
export async function signUp(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;
  const userRole = formData.get('userRole') as string;
  
  if (!email || !password || !fullName) {
    return {
      success: false,
      error: 'All fields are required'
    };
  }
  
  const supabase = createClient();
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      }
    }
  });
  
  if (error) {
    return {
      success: false,
      error: error.message
    };
  }
  
  // Sync with our database
  if (data.user) {
    await syncUserAfterAuth(
      data.user.id,
      data.user.email || email,
      fullName,
      userRole,
      '/auth/verify'
    );
  }
  
  return {
    success: true
  };
}

/**
 * Sign out
 */
export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

/**
 * Reset password request
 */
export async function resetPasswordRequest(formData: FormData) {
  const email = formData.get('email') as string;
  
  if (!email) {
    return {
      success: false,
      error: 'Email is required'
    };
  }
  
  const supabase = createClient();
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`
  });
  
  if (error) {
    return {
      success: false,
      error: error.message
    };
  }
  
  return {
    success: true
  };
}

/**
 * Reset password confirmation
 */
export async function resetPassword(formData: FormData) {
  const password = formData.get('password') as string;
  
  if (!password) {
    return {
      success: false,
      error: 'Password is required'
    };
  }
  
  const supabase = createClient();
  
  const { error } = await supabase.auth.updateUser({
    password
  });
  
  if (error) {
    return {
      success: false,
      error: error.message
    };
  }
  
  return {
    success: true
  };
}

/**
 * Update role and create profile
 */
export async function createProfile(formData: FormData) {
  // This function will be called after a user selects their role (craftsman/builder)
  // and fills out their initial profile information
  
  // Form data processing will depend on whether it's a craftsman or builder profile
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return {
      success: false,
      error: 'Not authenticated'
    };
  }
  
  // Get form data
  const userRole = formData.get('userRole') as string;
  const companyName = formData.get('companyName') || formData.get('businessName') as string;
  const location = formData.get('location') as string;
  
  // Sync with our database and set onboarding to true
  const result = await syncUserAfterAuth(
    user.id,
    user.email || '',
    user.user_metadata?.full_name || '',
    userRole
  );
  
  if (!result.success) {
    return {
      success: false,
      error: result.message
    };
  }
  
  // TODO: Create profile in the database based on role
  // This will be handled by the role-specific profile creation pages
  
  return {
    success: true
  };
} 