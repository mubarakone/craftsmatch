import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StorefrontCard } from "@/components/shared/storefront-card";
import { Store } from "lucide-react";
import { getFeaturedStorefronts } from "@/lib/storefront/queries";
import { Suspense } from "react";

// Make this page dynamic to avoid static build issues
export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Browse Storefronts | CraftsMatch",
  description: "Explore handmade craft storefronts from talented craftsmen around the world.",
};

// Loading state for storefronts grid
function StorefrontsLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="border rounded-lg p-4 animate-pulse">
          <div className="h-48 bg-gray-200 rounded-md mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
      ))}
    </div>
  );
}

// Storefronts container that fetches data
async function StorefrontsContainer() {
  // Fetch real data from the database
  const storefronts = await getFeaturedStorefronts(24);
  
  if (storefronts.length === 0) {
    return (
      <div className="text-center py-20 border rounded-lg bg-slate-50">
        <h3 className="text-lg font-medium mb-2">No storefronts available yet</h3>
        <p className="text-muted-foreground mb-6">
          Check back soon as craftsmen set up their online stores.
        </p>
        <Button asChild>
          <Link href="/storefront/setup">
            <Store className="mr-2 h-4 w-4" />
            Create Your Own Storefront
          </Link>
        </Button>
      </div>
    );
  }
  
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {storefronts.map((storefront) => (
          <StorefrontCard
            key={storefront.id}
            storefront={storefront}
            imageSize="medium"
          />
        ))}
      </div>
      
      <div className="mt-16 text-center">
        <Button asChild>
          <Link href="/storefront/setup">
            <Store className="mr-2 h-4 w-4" />
            Create Your Own Storefront
          </Link>
        </Button>
      </div>
    </>
  );
}

export default function StorefrontsDirectoryPage() {
  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Browse Storefronts
        </h1>
        <p className="text-muted-foreground">
          Discover unique craftsman storefronts and their handmade products
        </p>
      </div>
      
      <Suspense fallback={<StorefrontsLoading />}>
        <StorefrontsContainer />
      </Suspense>
    </div>
  );
} 