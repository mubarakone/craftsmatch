import { StorefrontSetupForm } from "@/components/storefront/setup-form";
import { auth } from "@/lib/auth/utils";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Create Your Storefront | CraftsMatch",
  description: "Set up your storefront to showcase and sell your handcrafted products.",
};

export default async function StorefrontSetupPage() {
  // Check if user is authenticated
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  return (
    <div className="container py-10">
      <StorefrontSetupForm />
    </div>
  );
} 