import { getFeaturedProducts } from "@/lib/marketplace/queries";
import { ProductCard } from "@/components/shared/product-card";
import Link from "next/link";

interface FeaturedProductsProps {
  limit?: number;
}

export async function FeaturedProducts({ limit = 6 }: FeaturedProductsProps) {
  const products = await getFeaturedProducts(limit);

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Featured Products</h2>
        <p className="text-gray-500">No featured products available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Featured Products</h2>
        <Link 
          href="/marketplace" 
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          View all products →
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
} 