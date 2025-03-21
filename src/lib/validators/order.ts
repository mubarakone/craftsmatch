import { z } from "zod";

export const orderFormSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive().default(1),
  customizations: z.record(z.string()).optional(),
  notes: z.string().optional(),
  shipping: z.object({
    recipientName: z.string().min(1, "Recipient name is required"),
    addressLine1: z.string().min(1, "Address line 1 is required"),
    addressLine2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zipCode: z.string().min(1, "Zip code is required"),
    country: z.string().min(1, "Country is required"),
    phoneNumber: z.string().optional(),
    shippingMethod: z.string().min(1, "Shipping method is required"),
    specialInstructions: z.string().optional(),
  }),
});

export const sampleRequestSchema = z.object({
  productId: z.string().uuid(),
  requestReason: z.string().min(10, "Please provide a detailed reason for your sample request"),
  shipping: z.object({
    recipientName: z.string().min(1, "Recipient name is required"),
    addressLine1: z.string().min(1, "Address line 1 is required"),
    addressLine2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zipCode: z.string().min(1, "Zip code is required"),
    country: z.string().min(1, "Country is required"),
    phoneNumber: z.string().optional(),
    specialInstructions: z.string().optional(),
  }),
});

export type OrderFormValues = z.infer<typeof orderFormSchema>;
export type SampleRequestValues = z.infer<typeof sampleRequestSchema>; 