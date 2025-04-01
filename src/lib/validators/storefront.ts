import { z } from "zod";

export const storefrontFormSchema = z.object({
  name: z.string().min(3, {
    message: "Storefront name must be at least 3 characters.",
  }),
  slug: z.string().min(3, {
    message: "Slug must be at least 3 characters.",
  }).regex(/^[a-z0-9-]+$/, {
    message: "Slug can only contain lowercase letters, numbers, and hyphens.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  location: z.string().optional(),
  contactEmail: z.string().email({
    message: "Please enter a valid email address.",
  }).optional(),
  contactPhone: z.string().optional(),
});

export const appearanceFormSchema = z.object({
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: "Please enter a valid hex color code.",
  }),
  secondaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: "Please enter a valid hex color code.",
  }),
  accentColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: "Please enter a valid hex color code.",
  }),
  fontFamily: z.string(),
  headerLayout: z.string(),
  productCardStyle: z.string(),
  customCss: z.string().optional(),
});

export type StorefrontFormValues = z.infer<typeof storefrontFormSchema>;
export type AppearanceFormValues = z.infer<typeof appearanceFormSchema>; 