import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RoleSelectionForm } from "@/components/auth/role-selection-form";

export const metadata: Metadata = {
  title: "Select Your Role | CraftsMatch",
  description: "Choose whether you're a craftsman or a builder",
};

export default async function RoleSelectionPage() {
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
        Welcome to CraftsMatch
      </h1>
      <p className="mt-2 text-center text-sm text-gray-600">
        Choose your role to get started
      </p>

      <div className="mt-8">
        <RoleSelectionForm />
      </div>
    </>
  );
} 