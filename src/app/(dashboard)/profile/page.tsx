import { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/session";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Your Profile | CraftsMatch",
  description: "View and manage your CraftsMatch profile",
};

export default async function ProfilePage() {
  const session = await requireAuth();
  const supabase = createClient();
  
  // Get user details including role
  const { data: user } = await supabase
    .from("users")
    .select("*, craftsman_profiles(*), builder_profiles(*)")
    .eq("auth_id", session.user.id)
    .single();

  if (!user) {
    return (
      <div className="container mx-auto py-10">
        <div className="bg-red-50 p-4 rounded-md mb-6">
          <p className="text-red-600">Error loading profile. Please try again.</p>
        </div>
        <Button asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    );
  }

  const isCraftsman = user.user_role === "craftsman";
  const profile = isCraftsman ? user.craftsman_profiles[0] : user.builder_profiles[0];

  if (!profile) {
    return (
      <div className="container mx-auto py-10">
        <div className="bg-yellow-50 p-4 rounded-md mb-6">
          <p className="text-yellow-600">
            Your profile is incomplete. Please complete your profile setup.
          </p>
        </div>
        <Button asChild>
          <Link href={isCraftsman ? "/craftsman-signup" : "/builder-signup"}>
            Complete Profile
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Profile</h1>
        <Button asChild>
          <Link href="/profile/edit">Edit Profile</Link>
        </Button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">
            {isCraftsman ? profile.business_name : profile.company_name}
          </h2>
          <p className="text-sm text-gray-500">
            {isCraftsman ? "Craftsman" : "Builder"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Contact Information</h3>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Email:</span> {user.email}
              </p>
              {profile.phone_number && (
                <p>
                  <span className="font-medium">Phone:</span> {profile.phone_number}
                </p>
              )}
              {profile.website && (
                <p>
                  <span className="font-medium">Website:</span>{" "}
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {profile.website}
                  </a>
                </p>
              )}
              <p>
                <span className="font-medium">Location:</span> {profile.location}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">
              {isCraftsman ? "Specialization" : "Project Types"}
            </h3>
            <p>{isCraftsman ? profile.specialization : profile.project_types}</p>
            
            {isCraftsman && (
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">Experience</h3>
                <p>{profile.years_of_experience} years</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Description</h3>
          <p className="whitespace-pre-line">{profile.description}</p>
        </div>
      </div>
    </div>
  );
} 