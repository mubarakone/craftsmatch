import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/supabase/server";
import { RoleSelectionForm } from "@/components/auth/role-selection-form";

export const metadata: Metadata = {
  title: "Select Your Role | CraftsMatch",
  description: "Choose whether you're a craftsman or a builder",
};

// Add dynamic configuration to prevent static build
export const dynamic = 'force-dynamic';

export default async function RoleSelectionPage() {
  // Skip authentication check during build
  if (process.env.NEXT_BUILD === 'true') {
    return renderRoleSelectionPage();
  }

  // Runtime authentication check
  const session = await getSession();

  if (!session) {
    redirect("/auth/sign-in");
  }

  // For build purposes, we'll skip the database check
  // In the real app, we would check if user already has a role
  // and redirect to the appropriate dashboard

  return renderRoleSelectionPage();
}

// Separate rendering function to avoid duplication
function renderRoleSelectionPage() {
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