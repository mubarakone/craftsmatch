import { z } from "zod";

// Common fields for both craftsman and builder profiles
const commonProfileSchema = {
  description: z.string().min(20, "Description must be at least 20 characters"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  phoneNumber: z.string().optional(),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
};

// Schema for craftsman profile
export const craftsmanProfileSchema = z.object({
  ...commonProfileSchema,
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  specialization: z.string().min(2, "Specialization must be at least 2 characters"),
  yearsOfExperience: z.string().refine(
    (val) => !isNaN(Number(val)) && Number(val) >= 0,
    "Years of experience must be a valid number"
  ),
});

// Schema for builder profile
export const builderProfileSchema = z.object({
  ...commonProfileSchema,
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  projectTypes: z.string().min(2, "Project types must be at least 2 characters"),
});

// Schema for account settings
export const accountSettingsSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
});

export type CraftsmanProfileFormValues = z.infer<typeof craftsmanProfileSchema>;
export type BuilderProfileFormValues = z.infer<typeof builderProfileSchema>;
export type AccountSettingsFormValues = z.infer<typeof accountSettingsSchema>; 