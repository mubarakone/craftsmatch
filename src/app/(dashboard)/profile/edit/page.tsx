import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/session";
import { ProfileForm } from "@/components/profile/profile-form";

export const metadata: Metadata = {
  title: "Edit Profile | CraftsMatch",
  description: "Update your CraftsMatch profile",
};

export default async function EditProfilePage() {
  const session = await requireAuth();
  const supabase = createClient();
  
  // Get user details including role
  const { data: user } = await supabase
    .from("users")
    .select("*, craftsman_profiles(*), builder_profiles(*)")
    .eq("auth_id", session.user.id)
    .single();

  if (!user) {
    redirect("/profile");
  }

  const isCraftsman = user.user_role === "craftsman";
  const profile = isCraftsman ? user.craftsman_profiles[0] : user.builder_profiles[0];

  if (!profile) {
    redirect(isCraftsman ? "/craftsman-signup" : "/builder-signup");
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-2xl font-bold">Edit Profile</h1>
      <ProfileForm 
        profile={profile} 
        isCraftsman={isCraftsman} 
      />
    </div>
  );
} 