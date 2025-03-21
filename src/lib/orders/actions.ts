"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";

// Schema for order validation
export const orderSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  customizations: z.record(z.string()).optional(),
  shippingAddress: z.object({
    recipientName: z.string().min(1, "Recipient name is required"),
    addressLine1: z.string().min(1, "Address is required"),
    addressLine2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zipCode: z.string().min(1, "Zip code is required"),
    country: z.string().min(1, "Country is required"),
    phoneNumber: z.string().optional(),
  }),
  specialInstructions: z.string().optional(),
});

// Create a sample request
export async function createSampleRequest(formData: FormData) {
  try {
    // In a real app, you would validate and process the form data
    // Generate a fake user ID since we're not using actual cookies
    const userId = "user_" + Math.random().toString(36).substring(2, 11);
    
    // Generate a fake sample request ID
    const sampleId = "sample_" + Math.random().toString(36).substring(2, 11);
    
    // Simulate database operation delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Extract values from FormData
    const productId = formData.get("productId") as string;
    const reason = formData.get("reason") as string;
    
    // Log the sample request data (would save to database in a real app)
    console.log("Sample request created:", {
      sampleId,
      userId,
      productId,
      reason,
      timestamp: new Date().toISOString(),
    });
    
    // Revalidate relevant paths
    revalidatePath("/dashboard/samples");
    
    return { success: true, sampleId };
  } catch (error) {
    console.error("Failed to create sample request:", error);
    return { success: false, error: "Failed to create sample request" };
  }
}

// Create an order
export async function createOrder(formData: FormData) {
  try {
    // In a real app, you would validate and process the form data
    // Generate a fake order ID
    const orderId = "order_" + Math.random().toString(36).substring(2, 11);
    
    // Simulate database operation delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Extract values from FormData
    const productId = formData.get("productId") as string;
    const quantity = parseInt(formData.get("quantity") as string || "1");
    
    // Log the order data (would save to database in a real app)
    console.log("Order created:", {
      orderId,
      productId,
      quantity,
      timestamp: new Date().toISOString(),
    });
    
    // Revalidate relevant paths
    revalidatePath("/dashboard/orders");
    
    return { success: true, orderId };
  } catch (error) {
    console.error("Failed to create order:", error);
    return { success: false, error: "Failed to create order" };
  }
}

// Create a revision request
export async function createRevisionRequest(formData: FormData) {
  try {
    // In a real app, you would validate and process the form data
    // Generate a fake revision ID
    const revisionId = "rev_" + Math.random().toString(36).substring(2, 11);
    
    // Simulate database operation delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Extract values from FormData
    const orderId = formData.get("orderId") as string;
    const description = formData.get("description") as string;
    
    // Log the revision request data (would save to database in a real app)
    console.log("Revision request created:", {
      revisionId,
      orderId,
      description,
      timestamp: new Date().toISOString(),
    });
    
    // Revalidate relevant paths
    revalidatePath(`/dashboard/orders/${orderId}`);
    
    return { success: true, revisionId };
  } catch (error) {
    console.error("Failed to create revision request:", error);
    return { success: false, error: "Failed to create revision request" };
  }
} 