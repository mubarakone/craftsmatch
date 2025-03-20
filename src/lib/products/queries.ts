import { db } from "@/lib/db";
import { products, productImages as productImagesTable, productAttributes, inventory, categories, attributes } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq, and, desc, asc, like, gte, lte, inArray, or, count as countFn, sql } from "drizzle-orm";
import { notFound } from "next/navigation";

export type ProductWithImages = {
  id: string;
  name: string;
  slug: string;
  description: string;
  craftmanId: string;
  price: number;
  discountPrice: number | null;
  currency: string;
  categoryId: string | null;
  isCustomizable: boolean;
  isPublished: boolean;
  dimensions: string | null;
  weight: number | null;
  weightUnit: string | null;
  material: string | null;
  color: string | null;
  leadTime: number | null;
  createdAt: Date;
  updatedAt: Date;
  images: {
    id: string;
    imageUrl: string;
    altText: string | null;
    displayOrder: number;
    isMain: boolean;
  }[];
  inventory: {
    quantity: number;
    reservedQuantity: number;
    sku: string | null;
    lowStockThreshold: number | null;
  } | null;
  attributes: {
    id: string;
    attributeId: string;
    value: string;
    attributeName: string;
    attributeType: string;
  }[];
};

export interface ProductWithCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice: number | null;
  currency: string;
  isPublished: boolean;
  isCustomizable: boolean;
  createdAt: Date;
  updatedAt: Date;
  categoryId: string | null;
  categoryName: string | null;
  categorySlug: string | null;
}

export interface ProductWithInventory extends ProductWithCategory {
  sku: string | null;
  quantity: number;
  reservedQuantity: number;
  lowStockThreshold: number | null;
  mainImage: string | null;
}

export type ProductListQueryParams = {
  userId: string;
  limit?: number;
  offset?: number;
  categoryId?: string;
  published?: boolean;
};

export async function getProductById(productId: string): Promise<ProductWithImages | null> {
  const supabase = createClient();
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  
  try {
    // Fetch product
    const [product] = await db
      .select()
      .from(products)
      .where(
        // If user is the owner, show even unpublished products
        user?.id 
          ? or(
              eq(products.id, productId),
              and(eq(products.id, productId), eq(products.craftmanId, user.id))
            )
          : and(eq(products.id, productId), eq(products.isPublished, true))
      )
      .limit(1);
    
    if (!product) {
      return null;
    }
    
    // Fetch product images
    const images = await db
      .select()
      .from(productImagesTable)
      .where(eq(productImagesTable.productId, productId))
      .orderBy(asc(productImagesTable.displayOrder));
    
    // Fetch inventory
    const [productInventory] = await db
      .select()
      .from(inventory)
      .where(eq(inventory.productId, productId))
      .limit(1);
    
    // Fetch product attributes with attribute details
    const productAttrsWithNames = await db
      .select({
        id: productAttributes.id,
        attributeId: productAttributes.attributeId,
        value: productAttributes.value,
        attributeName: attributes.name,
        attributeType: attributes.type,
      })
      .from(productAttributes)
      .innerJoin(attributes, eq(productAttributes.attributeId, attributes.id))
      .where(eq(productAttributes.productId, productId));
    
    return {
      ...product,
      images,
      inventory: productInventory || null,
      attributes: productAttrsWithNames,
    };
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export async function getProductsForCraftsman(
  craftsmanId: string,
  {
    page = 1,
    perPage = 12,
    sort = "newest",
    publishedOnly = false,
  }: {
    page?: number;
    perPage?: number;
    sort?: "newest" | "oldest" | "priceAsc" | "priceDesc" | "nameAsc" | "nameDesc";
    publishedOnly?: boolean;
  } = {}
) {
  try {
    // Calculate offset for pagination
    const offset = (page - 1) * perPage;
    
    // Create filter conditions
    let conditions = eq(products.craftmanId, craftsmanId);
    if (publishedOnly) {
      conditions = and(conditions, eq(products.isPublished, true));
    }
    
    // Execute query
    let query = db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        price: products.price,
        discountPrice: products.discountPrice,
        currency: products.currency,
        isPublished: products.isPublished,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
      })
      .from(products)
      .where(conditions);
    
    // Add sorting
    switch (sort) {
      case "oldest":
        query = query.orderBy(asc(products.createdAt));
        break;
      case "priceAsc":
        query = query.orderBy(asc(products.price));
        break;
      case "priceDesc":
        query = query.orderBy(desc(products.price));
        break;
      case "nameAsc":
        query = query.orderBy(asc(products.name));
        break;
      case "nameDesc":
        query = query.orderBy(desc(products.name));
        break;
      case "newest":
      default:
        query = query.orderBy(desc(products.createdAt));
        break;
    }
    
    // Add pagination
    const productsList = await query.limit(perPage).offset(offset);
    
    // Get count of all matching products for pagination
    const [countResult] = await db
      .select({ count: countFn() })
      .from(products)
      .where(conditions);
    
    // Get main image for each product
    const productsWithImages = await Promise.all(
      productsList.map(async (product) => {
        const [mainImage] = await db
          .select()
          .from(productImagesTable)
          .where(and(
            eq(productImagesTable.productId, product.id),
            eq(productImagesTable.isMain, true)
          ))
          .limit(1);
          
        return {
          ...product,
          mainImage: mainImage || null,
        };
      })
    );
    
    return {
      products: productsWithImages,
      pagination: {
        page,
        perPage,
        totalItems: Number(countResult?.count || 0),
        totalPages: Math.ceil(Number(countResult?.count || 0) / perPage),
      },
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      products: [],
      pagination: {
        page,
        perPage,
        totalItems: 0,
        totalPages: 0,
      },
    };
  }
}

export async function getCategories(parentId?: string | null) {
  try {
    let query = db.select().from(categories);
    
    if (parentId) {
      query = query.where(eq(categories.parentId, parentId));
    } else if (parentId === null) {
      query = query.where(eq(categories.parentId, null));
    }
    
    const categoriesList = await query.orderBy(asc(categories.name));
    return categoriesList;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function getCategoryAttributes(categoryId: string) {
  try {
    const categoryAttributes = await db
      .select()
      .from(attributes)
      .where(eq(attributes.categoryId, categoryId))
      .orderBy(asc(attributes.name));
    
    return categoryAttributes;
  } catch (error) {
    console.error("Error fetching category attributes:", error);
    return [];
  }
}

/**
 * Get paginated products for a craftsman
 */
export async function getCraftsmanProducts({
  userId,
  limit = 10,
  offset = 0,
  categoryId,
  published,
}: ProductListQueryParams) {
  try {
    // Base query to get products with categories
    let query = db.$with("products_with_categories").as(
      db
        .select({
          id: products.id,
          name: products.name,
          slug: products.slug,
          description: products.description,
          price: products.price,
          discountPrice: products.discountPrice,
          currency: products.currency,
          isPublished: products.isPublished,
          isCustomizable: products.isCustomizable,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
          categoryId: products.categoryId,
          categoryName: categories.name,
          categorySlug: categories.slug,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(eq(products.craftmanId, userId))
    );

    // Apply optional filters
    if (categoryId) {
      query = db.$with("products_with_categories").as(
        db
          .select({
            id: products.id,
            name: products.name,
            slug: products.slug,
            description: products.description,
            price: products.price,
            discountPrice: products.discountPrice,
            currency: products.currency,
            isPublished: products.isPublished,
            isCustomizable: products.isCustomizable,
            createdAt: products.createdAt,
            updatedAt: products.updatedAt,
            categoryId: products.categoryId,
            categoryName: categories.name,
            categorySlug: categories.slug,
          })
          .from(products)
          .leftJoin(categories, eq(products.categoryId, categories.id))
          .where(
            eq(products.craftmanId, userId) && 
            eq(products.categoryId, categoryId)
          )
      );
    }

    if (published !== undefined) {
      query = db.$with("products_with_categories").as(
        db
          .select({
            id: products.id,
            name: products.name,
            slug: products.slug,
            description: products.description,
            price: products.price,
            discountPrice: products.discountPrice,
            currency: products.currency,
            isPublished: products.isPublished,
            isCustomizable: products.isCustomizable,
            createdAt: products.createdAt,
            updatedAt: products.updatedAt,
            categoryId: products.categoryId,
            categoryName: categories.name,
            categorySlug: categories.slug,
          })
          .from(products)
          .leftJoin(categories, eq(products.categoryId, categories.id))
          .where(
            eq(products.craftmanId, userId) && 
            eq(products.isPublished, published)
          )
      );
    }

    // Add inventory and image data
    const result = await db
      .with(query)
      .select({
        id: sql<string>`products_with_categories.id`,
        name: sql<string>`products_with_categories.name`,
        slug: sql<string>`products_with_categories.slug`,
        description: sql<string>`products_with_categories.description`,
        price: sql<number>`products_with_categories.price`,
        discountPrice: sql<number | null>`products_with_categories.discount_price`,
        currency: sql<string>`products_with_categories.currency`,
        isPublished: sql<boolean>`products_with_categories.is_published`,
        isCustomizable: sql<boolean>`products_with_categories.is_customizable`,
        createdAt: sql<Date>`products_with_categories.created_at`,
        updatedAt: sql<Date>`products_with_categories.updated_at`,
        categoryId: sql<string | null>`products_with_categories.category_id`,
        categoryName: sql<string | null>`products_with_categories.category_name`,
        categorySlug: sql<string | null>`products_with_categories.category_slug`,
        sku: inventory.sku,
        quantity: inventory.quantity,
        reservedQuantity: inventory.reservedQuantity,
        lowStockThreshold: inventory.lowStockThreshold,
        mainImage: db
          .select({ imageUrl: productImagesTable.imageUrl })
          .from(productImagesTable)
          .where(
            eq(productImagesTable.productId, sql<string>`products_with_categories.id`) && 
            eq(productImagesTable.isMain, true)
          )
          .limit(1)
          .as<string | null>(),
      })
      .from("products_with_categories")
      .leftJoin(inventory, eq(sql<string>`products_with_categories.id`, inventory.productId))
      .orderBy(desc(sql<Date>`products_with_categories.updated_at`))
      .limit(limit)
      .offset(offset);

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(eq(products.craftmanId, userId));

    return {
      products: result,
      total: countResult[0]?.count || 0,
    };
  } catch (error) {
    console.error("Error fetching craftsman products:", error);
    return {
      products: [],
      total: 0,
    };
  }
}

/**
 * Get product by slug
 */
export async function getProductBySlug(slug: string) {
  try {
    const product = await db.query.products.findFirst({
      where: eq(products.slug, slug),
      with: {
        category: true,
        images: {
          orderBy: (images, { asc }) => [asc(images.displayOrder)],
        },
        inventory: true,
      },
    });

    return product;
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return null;
  }
}

/**
 * Get products by category
 */
export async function getProductsByCategory(categoryId: string, limit = 10, offset = 0) {
  try {
    // Get all subcategories recursively
    const getAllCategoryIds = async (categoryId: string): Promise<string[]> => {
      const subcategories = await db.query.categories.findMany({
        where: eq(categories.parentId, categoryId),
        columns: { id: true },
      });
      
      let ids = [categoryId];
      for (const subcategory of subcategories) {
        const subIds = await getAllCategoryIds(subcategory.id);
        ids = [...ids, ...subIds];
      }
      
      return ids;
    };
    
    const categoryIds = await getAllCategoryIds(categoryId);
    
    const result = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        price: products.price,
        discountPrice: products.discountPrice,
        currency: products.currency,
        isPublished: products.isPublished,
        isCustomizable: products.isCustomizable,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        categoryId: products.categoryId,
        categoryName: categories.name,
        categorySlug: categories.slug,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(
        inArray(products.categoryId, categoryIds) && 
        eq(products.isPublished, true)
      )
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset);
      
    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(
        inArray(products.categoryId, categoryIds) && 
        eq(products.isPublished, true)
      );
      
    return {
      products: result,
      total: countResult[0]?.count || 0,
    };
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return {
      products: [],
      total: 0,
    };
  }
} 