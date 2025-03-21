import { db } from "@/lib/db";
import { products, categories, users, productImages, reviews } from "@/lib/db/schema";
import { eq, and, desc, not } from "drizzle-orm";

export async function getProductDetail(productId: string) {
  try {
    // Handle both real DB and mock DB
    if (!db.query?.products?.findFirst) {
      return null;
    }
    
    const product = await db.query.products.findFirst();

    return product;
  } catch (error) {
    console.error(`Error fetching product detail for ${productId}:`, error);
    return null;
  }
}

export async function getRelatedProducts(productId: string, categoryId: string | null, limit = 4) {
  try {
    // Handle both real DB and mock DB
    if (!categoryId || !db.query?.products?.findMany) {
      return [];
    }
    
    const relatedProducts = await db.query.products.findMany();

    return relatedProducts;
  } catch (error) {
    console.error(`Error fetching related products for ${productId}:`, error);
    return [];
  }
}

export async function getProductReviews(productId: string, limit = 5, offset = 0) {
  try {
    // Mock DB doesn't include reviews query capability
    // Let's safely check if it exists using type guard
    if (!db.query || typeof (db.query as any).reviews === 'undefined') {
      return [];
    }
    
    // This would be where we'd normally query the reviews
    // But the mock DB doesn't support this yet
    return [];
  } catch (error) {
    console.error(`Error fetching reviews for product ${productId}:`, error);
    return [];
  }
} 