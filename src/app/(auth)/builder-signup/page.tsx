import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BuilderProfileForm } from "@/components/auth/builder-profile-form";

export const metadata: Metadata = {
  title: "Builder Profile | CraftsMatch",
  description: "Set up your builder profile",
};

export default async function BuilderSignupPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/sign-in");
  }

  // Check if user already has a role
  const { data: user } = await supabase
    .from("users")
    .select("user_role, is_onboarded")
    .eq("auth_id", session.user.id)
    .single();

  // If user already has a role and is onboarded, redirect to the appropriate dashboard
  if (user?.is_onboarded) {
    redirect(user.user_role === "craftsman" ? "/dashboard/craftsman" : "/dashboard/builder");
  }

  return (
    <>
      <h1 className="text-center text-2xl font-semibold tracking-tight">
        Complete Your Builder Profile
      </h1>
      <p className="mt-2 text-center text-sm text-gray-600">
        Tell craftsmen about your projects and interests
      </p>
      <BuilderProfileForm userId={session.user.id} />
    </>
  );
} 