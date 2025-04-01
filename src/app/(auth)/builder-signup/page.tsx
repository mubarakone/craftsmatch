import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/supabase/server";
import { BuilderProfileForm } from "@/components/auth/builder-profile-form";

export const metadata: Metadata = {
  title: "Builder Profile | CraftsMatch",
  description: "Set up your builder profile",
};

// Add dynamic configuration to prevent static build
export const dynamic = 'force-dynamic';

export default async function BuilderSignupPage() {
  // Skip authentication check during build
  if (process.env.NEXT_BUILD === 'true') {
    return (
      <>
        <h1 className="text-center text-2xl font-semibold tracking-tight">
          Complete Your Builder Profile
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Tell craftsmen about your projects and interests
        </p>
        <BuilderProfileForm userId="build-time-user-id" />
      </>
    );
  }

  // Regular runtime authentication
  const session = await getSession();

  if (!session) {
    redirect("/auth/sign-in");
  }

  // Check if user already has a role
  // This would normally query the database
  const userIsOnboarded = false; // In build mode, default to false
  const userRole = "builder"; // In build mode, default to builder

  // If user already has a role and is onboarded, redirect to the appropriate dashboard
  if (userIsOnboarded) {
    redirect(userRole === "craftsman" ? "/dashboard/craftsman" : "/dashboard/builder");
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