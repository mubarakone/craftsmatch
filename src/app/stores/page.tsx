import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StorefrontCard } from "@/components/shared/storefront-card";
import { Store } from "lucide-react";

// Mock data for build time
const mockStorefronts = [
  { 
    id: "1", 
    name: "Oak & Pine Workshop", 
    description: "Custom wooden furniture and decor items", 
    slug: "oak-pine-workshop",
    bannerUrl: null,
    logoUrl: null,
    location: "Portland, OR"
  },
  { 
    id: "2", 
    name: "Ceramic Creations", 
    description: "Handcrafted pottery and ceramic art", 
    slug: "ceramic-creations",
    bannerUrl: null,
    logoUrl: null,
    location: "Austin, TX"
  },
  { 
    id: "3", 
    name: "Textile Traditions", 
    description: "Handwoven textiles, upholstery, custom drapery", 
    slug: "textile-traditions",
    bannerUrl: null,
    logoUrl: null,
    location: "Santa Fe, NM"
  }
];

export const metadata = {
  title: "Browse Storefronts | CraftsMatch",
  description: "Explore handmade craft storefronts from talented craftsmen around the world.",
};

// Add dynamic configuration to prevent static build
export const dynamic = 'force-dynamic';

export default async function StorefrontsDirectoryPage() {
  // Use mock data during build
  let storefronts = mockStorefronts;
  
  // Only fetch real data at runtime
  if (process.env.NEXT_BUILD !== 'true') {
    try {
      // Dynamic import to avoid build-time issues
      const { getFeaturedStorefronts } = await import("@/lib/storefront/queries");
      // Get all storefronts (for now we'll use the featured endpoint with a high limit)
      storefronts = await getFeaturedStorefronts(24);
    } catch (error) {
      console.error("Error fetching storefronts:", error);
      // Use mock data if fetch fails
    }
  }
  
  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Browse Storefronts</h1>
          <p className="text-muted-foreground max-w-3xl">
            Discover unique stores from talented craftsmen. Each storefront offers handcrafted products with their own style and specialty.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button asChild variant="outline">
            <Link href="/marketplace">
              <Store className="mr-2 h-4 w-4" />
              Browse All Products
            </Link>
          </Button>
        </div>
      </div>

      {storefronts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {storefronts.map((storefront) => (
            <StorefrontCard
              key={storefront.id}
              storefront={storefront}
              imageSize="medium"
            />
          ))}
        </div>
      ) : (
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
      )}

      {storefronts.length > 0 && (
        <div className="mt-16 text-center">
          <Button asChild>
            <Link href="/storefront/setup">
              <Store className="mr-2 h-4 w-4" />
              Create Your Own Storefront
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
} 