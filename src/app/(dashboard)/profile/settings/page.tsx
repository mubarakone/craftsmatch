import { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/session";
import { AccountSettingsForm } from "@/components/profile/account-settings";

export const metadata: Metadata = {
  title: "Account Settings | CraftsMatch",
  description: "Manage your CraftsMatch account settings",
};

export default async function AccountSettingsPage() {
  const session = await requireAuth();
  const supabase = createClient();
  
  // Get user details
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("auth_id", session.user.id)
    .single();

  if (!user) {
    return (
      <div className="container mx-auto py-10">
        <div className="bg-red-50 p-4 rounded-md mb-6">
          <p className="text-red-600">Error loading account details. Please try again.</p>
        </div>
        <Link 
          href="/profile" 
          className="text-blue-600 hover:text-blue-500"
        >
          Return to Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <AccountSettingsForm user={user} />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Password and Security</h2>
          <p className="text-sm text-gray-600 mb-4">
            Manage your password and account security settings.
          </p>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Change Password</h3>
              <p className="text-sm text-gray-600 mb-2">
                Update your password to maintain account security.
              </p>
              <Link 
                href="/auth/reset-password" 
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Change Password
              </Link>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-medium text-red-600">Delete Account</h3>
              <p className="text-sm text-gray-600 mb-2">
                Permanently delete your account and all associated data.
              </p>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                onClick={() => alert("Delete account functionality will be implemented in a future update.")}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 