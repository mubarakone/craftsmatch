"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updateCraftsmanProfile(formData: FormData, profileId: string) {
  const supabase = createClient();
  
  const businessName = formData.get("businessName") as string;
  const description = formData.get("description") as string;
  const specialization = formData.get("specialization") as string;
  const yearsOfExperience = parseInt(formData.get("yearsOfExperience") as string);
  const location = formData.get("location") as string;
  const phoneNumber = formData.get("phoneNumber") as string || null;
  const website = formData.get("website") as string || null;

  const { error } = await supabase
    .from("craftsman_profiles")
    .update({
      business_name: businessName,
      description,
      specialization,
      years_of_experience: yearsOfExperience,
      location,
      phone_number: phoneNumber,
      website,
    })
    .eq("id", profileId);

  if (error) {
    return { error: error.message };
  }

  return redirect("/profile");
}

export async function updateBuilderProfile(formData: FormData, profileId: string) {
  const supabase = createClient();
  
  const companyName = formData.get("companyName") as string;
  const description = formData.get("description") as string;
  const projectTypes = formData.get("projectTypes") as string;
  const location = formData.get("location") as string;
  const phoneNumber = formData.get("phoneNumber") as string || null;
  const website = formData.get("website") as string || null;

  const { error } = await supabase
    .from("builder_profiles")
    .update({
      company_name: companyName,
      description,
      project_types: projectTypes,
      location,
      phone_number: phoneNumber,
      website,
    })
    .eq("id", profileId);

  if (error) {
    return { error: error.message };
  }

  return redirect("/profile");
}

export async function updateUserDetails(formData: FormData, userId: string) {
  const supabase = createClient();
  
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;

  // First update auth email if it changed
  const currentUser = await supabase.auth.getUser();
  if (email !== currentUser.data.user?.email) {
    const { error: authError } = await supabase.auth.updateUser({
      email,
    });
    
    if (authError) {
      return { error: authError.message };
    }
  }
  
  // Update user record
  const { error: updateError } = await supabase
    .from("users")
    .update({ 
      full_name: fullName,
      email,
      updated_at: new Date().toISOString()
    })
    .eq("id", userId);

  if (updateError) {
    return { error: updateError.message };
  }

  return { success: "Account information updated successfully!" };
} 