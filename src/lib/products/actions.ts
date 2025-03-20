"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/session";
import { createSlug } from "@/lib/utils";
import { products, productImages, inventory, productAttributes } from "@/lib/db/schema";
import { saveProductAttributes } from "@/lib/attributes/utils";

export type ProductDetailsData = {
  name: string;
  description: string;
  categoryId: string;
  isCustomizable: boolean;
  dimensions?: string;
  weight?: number;
  weightUnit?: string;
  material?: string;
  color?: string;
  leadTime?: number;
};

export type ProductImagesData = {
  images: {
    imageUrl: string;
    altText?: string;
    displayOrder: number;
    isMain: boolean;
  }[];
};

export type ProductPricingData = {
  price: number;
  discountPrice?: number;
  currency: string;
  sku?: string;
  quantity: number;
  lowStockThreshold?: number;
};

export type ProductShippingData = {
  shippingType: 'flat_rate' | 'calculated' | 'free';
  flatRate?: number;
  processingTime?: string;
  isReturnable: boolean;
  returnPolicy?: string;
  shippingNotes?: string;
};

export type ProductAttributesData = {
  attributes: {
    attributeId: string;
    value: string;
  }[];
};

/**
 * Create a new product
 */
export async function createProduct(productData: {
  details: ProductDetailsData;
  images: ProductImagesData;
  pricing: ProductPricingData;
  shipping?: ProductShippingData;
  attributes?: ProductAttributesData;
}) {
  try {
    const session = await requireAuth();
    
    if (!session || !session.user?.id) {
      return { success: false, error: "Unauthorized" };
    }
    
    const { details, images, pricing, shipping, attributes } = productData;
    
    // Create slug from name
    const slug = createSlug(details.name);
    
    // Check if slug already exists
    const existingProduct = await db.query.products.findFirst({
      where: eq(products.slug, slug),
    });
    
    if (existingProduct) {
      return { 
        success: false, 
        error: "A product with this name already exists. Please use a different name." 
      };
    }
    
    // Begin transaction
    const product = await db.transaction(async (tx) => {
      // Create the product
      const [newProduct] = await tx
        .insert(products)
        .values({
          name: details.name,
          slug,
          description: details.description,
          craftmanId: session.user.id,
          categoryId: details.categoryId,
          isCustomizable: details.isCustomizable,
          price: pricing.price,
          discountPrice: pricing.discountPrice || null,
          currency: pricing.currency,
          dimensions: details.dimensions || null,
          weight: details.weight || null,
          weightUnit: details.weightUnit || null,
          material: details.material || null,
          color: details.color || null,
          leadTime: details.leadTime || null,
          isPublished: false,  // Start as draft
        })
        .returning();
      
      // Create inventory entry
      await tx.insert(inventory).values({
        productId: newProduct.id,
        quantity: pricing.quantity,
        sku: pricing.sku || null,
        lowStockThreshold: pricing.lowStockThreshold || 5,
      });
      
      // Add product images
      if (images.images.length > 0) {
        const imageValues = images.images.map(image => ({
          productId: newProduct.id,
          imageUrl: image.imageUrl,
          altText: image.altText || null,
          displayOrder: image.displayOrder,
          isMain: image.isMain,
        }));
        
        await tx.insert(productImages).values(imageValues);
      }
      
      // Add product attributes if provided
      if (attributes && attributes.attributes.length > 0) {
        const attributeValues = attributes.attributes.map(attr => ({
          productId: newProduct.id,
          attributeId: attr.attributeId,
          value: attr.value,
        }));
        
        await tx.insert(productAttributes).values(attributeValues);
      }
      
      return newProduct;
    });
    
    return { 
      success: true, 
      productId: product.id,
      slug: product.slug
    };
  } catch (error) {
    console.error("Error creating product:", error);
    return { 
      success: false, 
      error: "Failed to create product. Please try again." 
    };
  }
}

/**
 * Update an existing product
 */
export async function updateProduct(
  productId: string,
  productData: Partial<{
    details: Partial<ProductDetailsData>;
    images: ProductImagesData;
    pricing: Partial<ProductPricingData>;
    shipping: Partial<ProductShippingData>;
    attributes: ProductAttributesData;
  }>
) {
  try {
    const session = await requireAuth();
    
    if (!session || !session.user?.id) {
      return { success: false, error: "Unauthorized" };
    }
    
    // Check if product exists and belongs to user
    const existingProduct = await db.query.products.findFirst({
      where: and(
        eq(products.id, productId),
        eq(products.craftmanId, session.user.id)
      ),
    });
    
    if (!existingProduct) {
      return { success: false, error: "Product not found or you don't have permission to edit it" };
    }
    
    await db.transaction(async (tx) => {
      // Update product details if provided
      if (productData.details) {
        const { details } = productData;
        let slug = existingProduct.slug;
        
        // If name changed, update slug
        if (details.name && details.name !== existingProduct.name) {
          slug = createSlug(details.name);
          
          // Check if new slug already exists for a different product
          const slugExists = await tx.query.products.findFirst({
            where: and(
              eq(products.slug, slug),
              eq(products.id, productId, true)
            ),
          });
          
          if (slugExists) {
            throw new Error("A product with this name already exists");
          }
        }
        
        await tx
          .update(products)
          .set({
            name: details.name || existingProduct.name,
            slug,
            description: details.description || existingProduct.description,
            categoryId: details.categoryId || existingProduct.categoryId,
            isCustomizable: details.isCustomizable !== undefined 
              ? details.isCustomizable 
              : existingProduct.isCustomizable,
            dimensions: details.dimensions !== undefined 
              ? details.dimensions 
              : existingProduct.dimensions,
            weight: details.weight !== undefined 
              ? details.weight 
              : existingProduct.weight,
            weightUnit: details.weightUnit !== undefined 
              ? details.weightUnit 
              : existingProduct.weightUnit,
            material: details.material !== undefined 
              ? details.material 
              : existingProduct.material,
            color: details.color !== undefined 
              ? details.color 
              : existingProduct.color,
            leadTime: details.leadTime !== undefined 
              ? details.leadTime 
              : existingProduct.leadTime,
            updatedAt: new Date(),
          })
          .where(eq(products.id, productId));
      }
      
      // Update pricing if provided
      if (productData.pricing) {
        const { pricing } = productData;
        
        await tx
          .update(products)
          .set({
            price: pricing.price !== undefined ? pricing.price : existingProduct.price,
            discountPrice: pricing.discountPrice !== undefined 
              ? pricing.discountPrice 
              : existingProduct.discountPrice,
            currency: pricing.currency || existingProduct.currency,
            updatedAt: new Date(),
          })
          .where(eq(products.id, productId));
        
        // Update inventory
        const existingInventory = await tx.query.inventory.findFirst({
          where: eq(inventory.productId, productId),
        });
        
        if (existingInventory) {
          await tx
            .update(inventory)
            .set({
              quantity: pricing.quantity !== undefined 
                ? pricing.quantity 
                : existingInventory.quantity,
              sku: pricing.sku !== undefined 
                ? pricing.sku 
                : existingInventory.sku,
              lowStockThreshold: pricing.lowStockThreshold !== undefined 
                ? pricing.lowStockThreshold 
                : existingInventory.lowStockThreshold,
              updatedAt: new Date(),
            })
            .where(eq(inventory.productId, productId));
        } else {
          await tx.insert(inventory).values({
            productId,
            quantity: pricing.quantity || 0,
            sku: pricing.sku || null,
            lowStockThreshold: pricing.lowStockThreshold || 5,
          });
        }
      }
      
      // Update images if provided
      if (productData.images) {
        const { images } = productData;
        
        // Delete existing images
        await tx
          .delete(productImages)
          .where(eq(productImages.productId, productId));
        
        // Add new images
        if (images.images.length > 0) {
          const imageValues = images.images.map(image => ({
            productId,
            imageUrl: image.imageUrl,
            altText: image.altText || null,
            displayOrder: image.displayOrder,
            isMain: image.isMain,
          }));
          
          await tx.insert(productImages).values(imageValues);
        }
      }
      
      // Update attributes if provided
      if (productData.attributes && productData.attributes.attributes.length > 0) {
        await saveProductAttributes(productId, productData.attributes.attributes);
      }
    });
    
    revalidatePath(`/products/${productId}`);
    revalidatePath(`/products/${productId}/edit`);
    revalidatePath(`/products`);
    
    return { success: true, productId };
  } catch (error) {
    console.error("Error updating product:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update product" };
  }
}

/**
 * Delete a product
 */
export async function deleteProduct(productId: string) {
  try {
    const session = await requireAuth();
    
    if (!session || !session.user?.id) {
      return { success: false, error: "Unauthorized" };
    }
    
    // Check if product exists and belongs to user
    const existingProduct = await db.query.products.findFirst({
      where: and(
        eq(products.id, productId),
        eq(products.craftmanId, session.user.id)
      ),
    });
    
    if (!existingProduct) {
      return { success: false, error: "Product not found or you don't have permission to delete it" };
    }
    
    // Delete product (all related records will be cascaded due to FK constraints)
    await db.delete(products).where(eq(products.id, productId));
    
    revalidatePath(`/products`);
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { success: false, error: "Failed to delete product" };
  }
}

/**
 * Toggle product published status
 */
export async function toggleProductPublished(productId: string) {
  try {
    const session = await requireAuth();
    
    if (!session || !session.user?.id) {
      return { success: false, error: "Unauthorized" };
    }
    
    // Check if product exists and belongs to user
    const existingProduct = await db.query.products.findFirst({
      where: and(
        eq(products.id, productId),
        eq(products.craftmanId, session.user.id)
      ),
    });
    
    if (!existingProduct) {
      return { success: false, error: "Product not found or you don't have permission to edit it" };
    }
    
    // Toggle published status
    await db
      .update(products)
      .set({
        isPublished: !existingProduct.isPublished,
        updatedAt: new Date(),
      })
      .where(eq(products.id, productId));
    
    revalidatePath(`/products/${productId}`);
    revalidatePath(`/products`);
    
    return { 
      success: true, 
      published: !existingProduct.isPublished 
    };
  } catch (error) {
    console.error("Error toggling product published status:", error);
    return { success: false, error: "Failed to update product status" };
  }
} 