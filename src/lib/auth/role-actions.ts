"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Updates a user's role in the database
 */
export async function updateUserRole(role: "craftsman" | "builder", userId: string) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from("users")
    .update({ 
      user_role: role,
      updated_at: new Date().toISOString() 
    })
    .eq("auth_id", userId);

  if (error) {
    throw new Error(`Failed to update user role: ${error.message}`);
  }
  
  revalidatePath("/profile");
  return { success: true };
}

/**
 * Completes the onboarding process by marking the user as onboarded
 */
export async function completeOnboarding(userId: string) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from("users")
    .update({ 
      is_onboarded: true,
      updated_at: new Date().toISOString() 
    })
    .eq("auth_id", userId);

  if (error) {
    throw new Error(`Failed to complete onboarding: ${error.message}`);
  }
  
  revalidatePath("/profile");
  return { success: true };
}

/**
 * Gets the current user's role
 */
export async function getUserRole() {
  const supabase = createClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect("/auth/sign-in");
  }
  
  const { data, error } = await supabase
    .from("users")
    .select("user_role, is_onboarded")
    .eq("auth_id", session.user.id)
    .single();
  
  if (error) {
    throw new Error(`Failed to get user role: ${error.message}`);
  }
  
  return data;
} 