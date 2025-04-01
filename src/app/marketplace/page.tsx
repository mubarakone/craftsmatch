import { Suspense } from "react";
import { CategoryShowcase } from "@/components/marketplace/category-showcase";
import { Pagination } from "@/components/shared/pagination";
import { FilterSidebar } from "@/components/shared/filter-sidebar";
import { SearchBar } from "@/components/shared/search-bar";
import { StorefrontCard } from "@/components/shared/storefront-card";

// Mock data for build time
const mockCategories = [
  { id: "1", name: "Furniture", slug: "furniture", parentId: null, subcategories: [] },
  { id: "2", name: "Ceramics", slug: "ceramics", parentId: null, subcategories: [] },
  { id: "3", name: "Textiles", slug: "textiles", parentId: null, subcategories: [] },
  { id: "4", name: "Woodworking", slug: "woodworking", parentId: null, subcategories: [] },
  { id: "5", name: "Metalwork", slug: "metalwork", parentId: null, subcategories: [] },
  { id: "6", name: "Glass", slug: "glass", parentId: null, subcategories: [] }
];

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
  }
];

interface MarketplacePageProps {
  searchParams: {
    query?: string;
    category?: string;
    page?: string;
    perPage?: string;
    sort?: string;
    priceMin?: string;
    priceMax?: string;
  };
}

// Add dynamic configuration to prevent static build
export const dynamic = 'force-dynamic';

export default async function MarketplacePage({
  searchParams,
}: MarketplacePageProps) {
  // Use mock data during build
  let categories = mockCategories;
  let topCategories = mockCategories.slice(0, 3);
  let featuredStorefronts = mockStorefronts;
  
  // Only fetch real data at runtime
  if (process.env.NEXT_BUILD !== 'true') {
    try {
      // Dynamic imports to avoid build-time issues
      const { getAllCategories, getTopCategories } = await import("@/lib/marketplace/queries");
      const { getFeaturedStorefronts } = await import("@/lib/storefront/queries");
      
      // Fetch categories data
      categories = await getAllCategories();
      topCategories = await getTopCategories();
      
      // Fetch featured storefronts
      featuredStorefronts = await getFeaturedStorefronts(6);
    } catch (error) {
      console.error("Error fetching marketplace data:", error);
      // Use mock data if fetch fails
    }
  }
  
  // Parse search parameters
  const query = searchParams?.query || "";
  const category = searchParams?.category || "";
  const pageParam = searchParams?.page || "1";
  const perPageParam = searchParams?.perPage || "12";
  
  const page = parseInt(pageParam);
  const perPage = parseInt(perPageParam);
  
  // Create sanitized searchParams object
  const safeSearchParams = {
    query,
    category,
    page: pageParam,
    perPage: perPageParam,
    sort: searchParams?.sort || "newest",
    priceMin: searchParams?.priceMin || "",
    priceMax: searchParams?.priceMax || ""
  };
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Browse Craftsman Products</h1>
      
      <div className="mb-8">
        <SearchBar placeholder="Search for products..." />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <FilterSidebar categories={categories} />
        </div>
        
        <div className="md:col-span-3">
          <Suspense fallback={<div>Loading categories...</div>}>
            <CategoryShowcase categories={topCategories} />
          </Suspense>
          
          {/* Featured Storefronts */}
          <div className="mt-12 mb-12">
            <h2 className="text-2xl font-semibold mb-6">Featured Storefronts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {featuredStorefronts.map((storefront) => (
                <StorefrontCard 
                  key={storefront.id} 
                  storefront={storefront}
                  imageSize="medium"
                />
              ))}
            </div>
          </div>
          
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">All Products</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                <select className="border rounded-md p-2 text-sm">
                  <option value="newest">Newest</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                  <option value="popular">Popular</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Products will be loaded here */}
              <div className="col-span-full text-center py-12 text-gray-500">
                Select a category or search for products to begin
              </div>
            </div>
            
            <Pagination 
              currentPage={page} 
              totalPages={1} 
              baseUrl="/marketplace" 
              searchParams={safeSearchParams}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 