import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

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

      <div className="mt-8 space-y-10">
        <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
          <h2 className="text-xl font-medium">Craftsman</h2>
          <p className="mt-2 text-sm text-gray-600">
            Showcase and sell your hand-crafted building materials to builders looking for quality artisanal products.
          </p>
          <div className="mt-4">
            <Link href="/craftsman-signup">
              <Button className="w-full">Continue as Craftsman</Button>
            </Link>
          </div>
        </div>

        <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
          <h2 className="text-xl font-medium">Builder</h2>
          <p className="mt-2 text-sm text-gray-600">
            Find unique, high-quality building materials crafted by skilled artisans for your construction projects.
          </p>
          <div className="mt-4">
            <Link href="/builder-signup">
              <Button className="w-full">Continue as Builder</Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
} 