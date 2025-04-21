'use server';

import { db, executeRawQuery } from '@/lib/db';
import { storefronts, storefrontCustomization, products, productImages } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { StorefrontWithCustomization } from './types';

/**
 * Retrieves a storefront by ID including its customization settings
 */
export async function getStorefrontWithCustomization(storefrontId: string): Promise<StorefrontWithCustomization | null> {
  try {
    // Check if we have a proper database connection
    if (typeof db.query?.storefronts?.findFirst !== 'function') {
      console.warn('Using direct SQL query for getStorefrontWithCustomization');
      // Fallback to direct SQL query
      const results = await executeRawQuery(`
        SELECT s.*, sc.*
        FROM storefronts s
        LEFT JOIN storefront_customization sc ON s.id = sc.storefront_id
        WHERE s.id = $1
        LIMIT 1
      `, [storefrontId]);
      
      if (results.length === 0) return null;
      
      return {
        ...results[0],
        customization: results[0].storefront_id ? {
          primaryColor: results[0].primary_color,
          secondaryColor: results[0].secondary_color,
          accentColor: results[0].accent_color,
          fontFamily: results[0].font_family,
          headerLayout: results[0].header_layout,
          productCardStyle: results[0].product_card_style,
          customCss: results[0].custom_css,
        } : undefined
      };
    }
    
    // Use Drizzle ORM
    const result = await db.query.storefronts.findFirst({
      where: eq(storefronts.id, storefrontId),
      with: {
        customization: true
      }
    });

    if (!result) return null;

    return {
      ...result,
      customization: result.customization.length > 0 ? result.customization[0] : undefined
    };
  } catch (error) {
    console.error('Error fetching storefront with customization:', error);
    return null;
  }
}

/**
 * Retrieves all storefronts for a user
 */
export async function getUserStorefronts(userId: string) {
  try {
    // Check if we have a proper database connection
    if (typeof db.query?.storefronts?.findMany !== 'function') {
      console.warn('Using direct SQL query for getUserStorefronts');
      // Fallback to direct SQL query
      const results = await executeRawQuery(`
        SELECT *
        FROM storefronts
        WHERE user_id = $1
        ORDER BY updated_at DESC
      `, [userId]);
      
      return results;
    }
    
    return await db.query.storefronts.findMany({
      where: eq(storefronts.userId, userId),
      orderBy: [desc(storefronts.updatedAt)]
    });
  } catch (error) {
    console.error('Error fetching user storefronts:', error);
    return [];
  }
}

/**
 * Retrieves a storefront by slug for public viewing
 */
export async function getStorefrontBySlug(slug: string): Promise<StorefrontWithCustomization | null> {
  try {
    // Check if we have a proper database connection
    if (typeof db.query?.storefronts?.findFirst !== 'function') {
      console.warn('Using direct SQL query for getStorefrontBySlug');
      // Fallback to direct SQL query
      const results = await executeRawQuery(`
        SELECT s.*, sc.*
        FROM storefronts s
        LEFT JOIN storefront_customization sc ON s.id = sc.storefront_id
        WHERE s.slug = $1
        LIMIT 1
      `, [slug]);
      
      if (results.length === 0) return null;
      
      return {
        ...results[0],
        customization: results[0].storefront_id ? {
          primaryColor: results[0].primary_color,
          secondaryColor: results[0].secondary_color,
          accentColor: results[0].accent_color,
          fontFamily: results[0].font_family,
          headerLayout: results[0].header_layout,
          productCardStyle: results[0].product_card_style,
          customCss: results[0].custom_css,
        } : undefined
      };
    }
    
    const result = await db.query.storefronts.findFirst({
      where: eq(storefronts.slug, slug),
      with: {
        customization: true
      }
    });

    if (!result) return null;

    return {
      ...result,
      customization: result.customization.length > 0 ? result.customization[0] : undefined
    };
  } catch (error) {
    console.error('Error fetching storefront by slug:', error);
    return null;
  }
}

/**
 * Retrieves products for a specific storefront
 */
export async function getStorefrontProducts(storefrontId: string) {
  try {
    // Check if we have a proper database connection with proper methods
    if (typeof db.select !== 'function') {
      console.warn('Using direct SQL query for getStorefrontProducts');
      // Fallback to direct SQL query
      const results = await executeRawQuery(`
        SELECT p.id, p.name, p.price, p.slug, pi.image_url
        FROM products p
        LEFT JOIN (
          SELECT DISTINCT ON (product_id) product_id, image_url
          FROM product_images
          WHERE is_main = TRUE
          ORDER BY product_id, id
        ) pi ON p.id = pi.product_id
        WHERE p.storefront_id = $1
        LIMIT 6
      `, [storefrontId]);
      
      return results.map(row => ({
        id: row.id,
        name: row.name,
        price: row.price,
        slug: row.slug,
        imageUrl: row.image_url
      }));
    }
    
    // Use Drizzle ORM
    const productsData = await db
      .select({
        id: products.id,
        name: products.name,
        price: products.price,
        slug: products.slug,
      })
      .from(products)
      .where(eq(products.storefrontId, storefrontId))
      .limit(6);

    // Get main image for each product
    const productsWithImages = await Promise.all(
      productsData.map(async (product) => {
        const [mainImage] = await db
          .select({ imageUrl: productImages.imageUrl })
          .from(productImages)
          .where(
            and(
              eq(productImages.productId, product.id),
              eq(productImages.isMain, true)
            )
          )
          .limit(1);

        return {
          ...product,
          imageUrl: mainImage?.imageUrl,
        };
      })
    );

    return productsWithImages;
  } catch (error) {
    console.error('Error fetching storefront products:', error);
    return [];
  }
}

/**
 * Retrieves featured storefronts for the marketplace homepage
 */
export async function getFeaturedStorefronts() {
  try {
    if (db) {
      // Use ORM if database is available
      return await db.query.storefronts.findMany({
        where: eq(storefronts.isFeatured, true),
        limit: 8,
        with: {
          owner: {
            columns: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
        },
      });
    } else {
      // Fallback to direct SQL with IPv4 forcing
      console.warn("Using direct SQL for getFeaturedStorefronts (db connection unavailable)");
      
      const sql = `
        SELECT s.*, u.full_name as owner_name, u.avatar_url
        FROM storefronts s
        JOIN users u ON s.owner_id = u.id
        WHERE s.is_featured = true
        LIMIT 8
      `;
      
      return await executeRawQuery(sql);
    }
  } catch (error) {
    console.error("Error fetching featured storefronts:", error);
    return [];
  }
} 