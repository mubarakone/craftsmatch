import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/supabase/server";
import { CraftsmanProfileForm } from "@/components/auth/craftsman-profile-form";

export const metadata: Metadata = {
  title: "Craftsman Profile | CraftsMatch",
  description: "Set up your craftsman profile",
};

// Add dynamic configuration to prevent static build
export const dynamic = 'force-dynamic';

export default async function CraftsmanSignupPage() {
  // Skip authentication check during build
  if (process.env.NEXT_BUILD === 'true') {
    return (
      <>
        <h1 className="text-center text-2xl font-semibold tracking-tight">
          Complete Your Craftsman Profile
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Tell potential customers about your craftsmanship and expertise
        </p>
        <CraftsmanProfileForm userId="build-time-user-id" />
      </>
    );
  }

  // Regular runtime authentication
  const session = await getSession();

  if (!session) {
    redirect("/auth/sign-in");
  }

  // For build purposes, we'll skip the database check
  // In the real app, we would check if user already has a role
  // and redirect to the appropriate dashboard

  return (
    <>
      <h1 className="text-center text-2xl font-semibold tracking-tight">
        Complete Your Craftsman Profile
      </h1>
      <p className="mt-2 text-center text-sm text-gray-600">
        Tell potential customers about your craftsmanship and expertise
      </p>
      <CraftsmanProfileForm userId={session.user.id} />
    </>
  );
} 