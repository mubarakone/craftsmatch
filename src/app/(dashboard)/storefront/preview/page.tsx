import { StorefrontPreview } from "@/components/storefront/storefront-preview";
import { getStorefrontWithCustomization, getStorefrontProducts } from "@/lib/storefront/queries";
import { auth } from "@/lib/auth/utils";
import { notFound, redirect } from "next/navigation";

export const metadata = {
  title: "Preview Your Storefront | CraftsMatch",
  description: "Preview how your storefront will look to customers.",
};

interface PreviewPageProps {
  searchParams: { id?: string };
}

export default async function PreviewPage({ searchParams }: PreviewPageProps) {
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

  // Get products for this storefront
  const products = await getStorefrontProducts(storefrontId);

  return (
    <div className="bg-white">
      <StorefrontPreview 
        storefront={storefront}
        products={products}
      />
    </div>
  );
} 