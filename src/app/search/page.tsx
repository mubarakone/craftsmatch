"use client";

import { Suspense } from "react";
import { ProductCard } from "@/components/shared/product-card";
import { Pagination } from "@/components/shared/pagination";
import { FilterSidebar } from "@/components/shared/filter-sidebar";
import { SearchBar } from "@/components/shared/search-bar";
import { searchProducts, getAllCategories } from "@/lib/marketplace/queries";

// Match the Product interface expected by ProductCard
interface ProductImage {
  id: string;
  imageUrl: string;
  altText: string | null;
  isMain: boolean;
}

interface Product {
  id: string;
  name: string;
  price: number;
  discountPrice?: number | null;
  craftmanId: string;
  categoryId?: string | null;
  isPublished: boolean;
  slug: string;
  description: string;
  images?: ProductImage[];
  craftsman?: {
    name?: string;
  };
  category?: {
    name?: string;
    slug?: string;
  };
}

interface SearchPageProps {
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

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams?.query || "";
  const pageParam = searchParams?.page || "1";
  const perPageParam = searchParams?.perPage || "12";
  
  const page = parseInt(pageParam);
  const perPage = parseInt(perPageParam);
  
  const categories = await getAllCategories();
  const products = query ? (await searchProducts(query, perPage, (page - 1) * perPage) as Product[]) : [];
  
  // Mock total pages for pagination
  const totalPages = products.length < perPage ? 1 : 5;
  
  // Create sanitized searchParams object
  const safeSearchParams = {
    query: query,
    category: searchParams?.category || "",
    page: pageParam,
    perPage: perPageParam,
    sort: searchParams?.sort || "newest",
    priceMin: searchParams?.priceMin || "",
    priceMax: searchParams?.priceMax || "",
  };
  
  const sortOptions = [
    { label: "Newest", value: "newest" },
    { label: "Price: Low to High", value: "priceAsc" },
    { label: "Price: High to Low", value: "priceDesc" },
    { label: "Name: A-Z", value: "nameAsc" },
    { label: "Name: Z-A", value: "nameDesc" },
  ];
  
  return (
    <div className="container py-8">
      <div className="mb-8">
        <SearchBar defaultValue={query} placeholder="Search for products..." />
      </div>
      
      <h1 className="text-3xl font-bold mb-6">
        {query ? `Search Results for "${query}"` : "Search"}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <FilterSidebar categories={categories} />
        </div>
        
        <div className="md:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-500">
              {products.length} results {query ? `for "${query}"` : ""}
            </p>
            
            <div className="flex items-center space-x-2">
              <label htmlFor="sort" className="text-sm text-gray-500">
                Sort by:
              </label>
              <select
                id="sort"
                className="text-sm border rounded-md p-2"
                defaultValue={safeSearchParams.sort}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : query ? (
            <div className="text-center py-16 bg-gray-50 rounded-lg">
              <h2 className="text-xl font-medium mb-2">No results found</h2>
              <p className="text-gray-500">
                We couldn't find any products matching "{query}"
              </p>
              <p className="text-gray-500 mt-1">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-lg">
              <h2 className="text-xl font-medium mb-2">Enter a search term</h2>
              <p className="text-gray-500">
                Type in the search box to find products
              </p>
            </div>
          )}
          
          {products.length > 0 && (
            <Pagination 
              currentPage={page} 
              totalPages={totalPages} 
              baseUrl="/search" 
              searchParams={safeSearchParams}
            />
          )}
        </div>
      </div>
    </div>
  );
} 