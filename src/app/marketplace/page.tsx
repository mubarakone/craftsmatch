import { Suspense } from "react";
import { CategoryShowcase } from "@/components/marketplace/category-showcase";
import { Pagination } from "@/components/shared/pagination";
import { FilterSidebar } from "@/components/shared/filter-sidebar";
import { SearchBar } from "@/components/shared/search-bar";
import { getAllCategories, getTopCategories } from "@/lib/marketplace/queries";

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

export default async function MarketplacePage({
  searchParams,
}: MarketplacePageProps) {
  // Fetch categories data
  const categories = await getAllCategories();
  const topCategories = await getTopCategories();
  
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