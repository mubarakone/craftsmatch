import { db, executeRawQuery } from "@/lib/db";
import { products, categories, users, craftsmanProfiles, productImages } from "@/lib/db/schema";
import { eq, desc, like, and, or } from "drizzle-orm";

export async function getFeaturedProducts(limit = 6) {
  try {
    // Handle both real DB and mock DB
    if (typeof db.query?.products?.findMany !== 'function') {
      return [];
    }
    
    const featuredProducts = await db.query.products.findMany({
      where: eq(products.isPublished, true),
      with: {
        craftsman: true,
        category: true,
        images: {
          limit: 1,
        },
      },
      limit,
      orderBy: [desc(products.createdAt)],
    });

    return featuredProducts;
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
}

export async function getTopCategories(limit = 6): Promise<any[]> {
  try {
    if (db) {
      // Use ORM if available
      if (typeof db.query?.categories?.findMany !== 'function') {
        return [];
      }
      
      const topCategories = await db.query.categories.findMany({
        with: {
          products: {
            limit: 1,
            with: {
              images: {
                limit: 1,
              },
            },
          },
        },
        limit,
      });

      return topCategories;
    } else {
      // Direct SQL fallback with IPv4 forcing
      console.warn("Using direct SQL for getTopCategories (db connection unavailable)");
      
      const sql = `
        SELECT c.id, c.name, c.slug, c.description, c.icon
        FROM categories c
        WHERE c.is_featured = true
        ORDER BY c.name
        LIMIT 8
      `;
      
      return await executeRawQuery(sql);
    }
  } catch (error) {
    console.error("Error fetching top categories:", error);
    return [];
  }
}

export async function getFeaturedArtisans(limit = 4) {
  try {
    // Mock implementation for craftsmanProfiles if not in DB
    if (typeof db.query?.craftsmanProfiles?.findMany !== 'function') {
      return [];
    }
    
    const featuredArtisans = await db.query.craftsmanProfiles.findMany({
      with: {
        user: true,
      },
      limit,
      orderBy: [desc(craftsmanProfiles.createdAt)],
    });

    // Get products for each craftsman
    if (typeof db.query?.products?.findMany === 'function') {
      for (const craftsman of featuredArtisans) {
        const craftsmanProducts = await db.query.products.findMany({
          where: eq(products.craftmanId, craftsman.userId),
          with: {
            images: {
              limit: 1,
            },
          },
          limit: 3,
        });
        
        // Attach products to craftsman
        (craftsman as any).products = craftsmanProducts;
      }
    }

    return featuredArtisans;
  } catch (error) {
    console.error("Error fetching featured artisans:", error);
    return [];
  }
}

export async function getProductsByCategory(categoryId: string, limit = 12, offset = 0) {
  try {
    // Handle both real DB and mock DB
    if (typeof db.query?.products?.findMany !== 'function') {
      return [];
    }
    
    const productsList = await db.query.products.findMany({
      where: and(eq(products.categoryId, categoryId), eq(products.isPublished, true)),
      with: {
        craftsman: true,
        category: true,
        images: {
          limit: 1,
        },
      },
      limit,
      offset,
      orderBy: [desc(products.createdAt)],
    });

    return productsList;
  } catch (error) {
    console.error(`Error fetching products for category ${categoryId}:`, error);
    return [];
  }
}

export async function searchProducts(query: string, limit = 12, offset = 0) {
  try {
    // Handle both real DB and mock DB
    if (typeof db.query?.products?.findMany !== 'function') {
      return [];
    }
    
    const searchResults = await db.query.products.findMany({
      where: and(
        eq(products.isPublished, true),
        or(
          like(products.name, `%${query}%`),
          like(products.description, `%${query}%`)
        )
      ),
      with: {
        craftsman: true,
        category: true,
        images: {
          limit: 1,
        },
      },
      limit,
      offset,
      orderBy: [desc(products.createdAt)],
    });

    return searchResults;
  } catch (error) {
    console.error(`Error searching products for "${query}":`, error);
    return [];
  }
}

export async function getAllCategories() {
  try {
    // Handle both real DB and mock DB
    if (typeof db.query?.categories?.findMany !== 'function') {
      return [];
    }
    
    const allCategories = await db.query.categories.findMany({
      with: {
        subcategories: true,
      },
    });

    return allCategories;
  } catch (error) {
    console.error("Error fetching all categories:", error);
    return [];
  }
} 