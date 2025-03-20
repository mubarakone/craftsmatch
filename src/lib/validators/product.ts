import { z } from "zod";

export const productDetailsSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters").max(100, "Product name cannot exceed 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000, "Description cannot exceed 2000 characters"),
  categoryId: z.string().uuid("Please select a valid category"),
  material: z.string().optional(),
  color: z.string().optional(),
  dimensions: z.string().optional(),
  weight: z.number().positive("Weight must be a positive number").optional(),
  weightUnit: z.string().optional(),
  isCustomizable: z.boolean().default(false),
  leadTime: z.number().int("Lead time must be a whole number").min(1, "Lead time must be at least 1 day").optional(),
});

export const productImagesSchema = z.object({
  images: z.array(
    z.object({
      url: z.string().url("Please provide a valid URL"),
      altText: z.string().optional(),
      isMain: z.boolean().default(false),
      displayOrder: z.number().int().default(0),
    })
  ).min(1, "At least one product image is required"),
});

export const productPricingSchema = z.object({
  price: z.number().positive("Price must be greater than 0"),
  discountPrice: z.number().positive("Discount price must be greater than 0").optional(),
  currency: z.string().default("USD"),
  sku: z.string().optional(),
  quantity: z.number().int("Quantity must be a whole number").default(0),
  lowStockThreshold: z.number().int("Threshold must be a whole number").default(5),
});

export const productAttributesSchema = z.object({
  attributes: z.array(
    z.object({
      attributeId: z.string().uuid("Please select a valid attribute"),
      value: z.string().min(1, "Attribute value is required"),
    })
  ).optional(),
});

export const createProductSchema = productDetailsSchema
  .merge(productImagesSchema)
  .merge(productPricingSchema)
  .merge(productAttributesSchema);

export type ProductDetailsFormValues = z.infer<typeof productDetailsSchema>;
export type ProductImagesFormValues = z.infer<typeof productImagesSchema>;
export type ProductPricingFormValues = z.infer<typeof productPricingSchema>;
export type ProductAttributesFormValues = z.infer<typeof productAttributesSchema>;
export type CreateProductFormValues = z.infer<typeof createProductSchema>; 