import { AppearanceEditor } from "@/components/storefront/appearance-editor";
import { getStorefrontWithCustomization } from "@/lib/storefront/queries";
import { auth } from "@/lib/auth/utils";
import { notFound, redirect } from "next/navigation";

export const metadata = {
  title: "Customize Your Storefront | CraftsMatch",
  description: "Personalize the look and feel of your storefront.",
};

interface CustomizePageProps {
  searchParams: { id?: string };
}

export default async function CustomizePage({ searchParams }: CustomizePageProps) {
  // Check if user is authenticated
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  const storefrontId = searchParams.id;
  if (!storefrontId) {
    redirect("/storefront/setup");
  }

  // Get storefront data
  const storefront = await getStorefrontWithCustomization(storefrontId);
  
  // Check if storefront exists and belongs to the user
  if (!storefront) {
    notFound();
  }
  
  if (storefront.userId !== session.user.id) {
    // This storefront doesn't belong to the current user
    redirect("/dashboard");
  }

  return (
    <div className="container py-10">
      <AppearanceEditor 
        storefrontId={storefrontId} 
        initialData={storefront.customization}
      />
    </div>
  );
} 