import { ProductCard } from "@/components/shared/product-card";
import { getProductsByCategory } from "@/lib/marketplace/queries";

interface RelatedProductsProps {
  productId: string;
  categoryId: string | null;
  limit?: number;
}

export async function RelatedProducts({ 
  productId, 
  categoryId, 
  limit = 4 
}: RelatedProductsProps) {
  if (!categoryId) {
    return null;
  }
  
  const products = await getProductsByCategory(categoryId, limit + 1);
  
  // Filter out the current product and limit to specified number
  const relatedProducts = products
    .filter(product => product.id !== productId)
    .slice(0, limit);
  
  if (relatedProducts.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
} 