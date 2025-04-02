import { Suspense } from "react";
import { CategoryShowcase } from "@/components/marketplace/category-showcase";
import { Pagination } from "@/components/shared/pagination";
import { FilterSidebar } from "@/components/shared/filter-sidebar";
import { SearchBar } from "@/components/shared/search-bar";
import { StorefrontCard } from "@/components/shared/storefront-card";
import { getAllCategories, getTopCategories } from "@/lib/marketplace/queries";
import { getFeaturedStorefronts } from "@/lib/storefront/queries";

// Make this page dynamic to avoid static build issues
export const dynamic = 'force-dynamic';

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

// Loading state for categories
function CategoriesLoading() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-square bg-gray-200 rounded-md mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
}

// Loading state for storefronts
function StorefrontsLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="animate-pulse border rounded-lg p-4">
          <div className="h-10 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="h-24 bg-gray-200 rounded mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      ))}
    </div>
  );
}

// Loading state for sidebar
function SidebarLoading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
      
      <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
    </div>
  );
}

// Categories container component
async function CategoriesContainer() {
  const categories = await getTopCategories(6);
  
  if (categories.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground">
          No categories available yet.
        </p>
      </div>
    );
  }
  
  return <CategoryShowcase categories={categories} />;
}

// Storefronts container component
async function StorefrontsContainer() {
  const storefronts = await getFeaturedStorefronts(6);
  
  if (storefronts.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground">
          No featured storefronts available yet.
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {storefronts.map((storefront) => (
        <StorefrontCard 
          key={storefront.id} 
          storefront={storefront}
          imageSize="medium"
        />
      ))}
    </div>
  );
}

// Sidebar container component 
async function SidebarContainer() {
  const categories = await getAllCategories();
  
  return (
    <FilterSidebar 
      categories={categories}
      activePriceRange={[0, 1000]}
    />
  );
}

export default function MarketplacePage({ searchParams }: MarketplacePageProps) {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">CraftsMatch Marketplace</h1>
      
      <div className="mb-8">
        <SearchBar placeholder="Search for crafts, products, or artisans..." />
      </div>
      
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Popular Categories</h2>
        <Suspense fallback={<CategoriesLoading />}>
          <CategoriesContainer />
        </Suspense>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <Suspense fallback={<SidebarLoading />}>
            <SidebarContainer />
          </Suspense>
        </div>
        
        <div className="md:col-span-3">
          <h2 className="text-2xl font-bold mb-6">Featured Storefronts</h2>
          <Suspense fallback={<StorefrontsLoading />}>
            <StorefrontsContainer />
          </Suspense>
        </div>
      </div>
    </div>
  );
} 