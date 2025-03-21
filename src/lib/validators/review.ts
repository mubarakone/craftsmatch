import { z } from "zod";

// Validation schema for submitting a review
export const reviewSchema = z.object({
  orderId: z.string().uuid({ message: "Invalid order ID format." }),
  productId: z.string().uuid({ message: "Invalid product ID format." }),
  revieweeId: z.string().uuid({ message: "Invalid user ID format." }),
  rating: z.number()
    .int({ message: "Rating must be a whole number." })
    .min(1, { message: "Rating must be at least 1 star." })
    .max(5, { message: "Rating cannot exceed 5 stars." }),
  title: z.string().max(100, { message: "Title cannot exceed 100 characters." }).optional(),
  content: z.string()
    .min(10, { message: "Review must be at least 10 characters." })
    .max(1000, { message: "Review cannot exceed 1000 characters." }),
  isPublic: z.boolean().default(true),
  images: z.array(z.string().url({ message: "Invalid image URL format." })).optional(),
});

// Validation schema for responding to a review
export const reviewResponseSchema = z.object({
  reviewId: z.string().uuid({ message: "Invalid review ID format." }),
  response: z.string()
    .min(10, { message: "Response must be at least 10 characters." })
    .max(1000, { message: "Response cannot exceed 1000 characters." }),
});

// Validation schema for reporting a review
export const reportReviewSchema = z.object({
  reviewId: z.string().uuid({ message: "Invalid review ID format." }),
  reason: z.string()
    .min(10, { message: "Reason must be at least 10 characters." })
    .max(500, { message: "Reason cannot exceed 500 characters." }),
  reporterEmail: z.string().email({ message: "Please enter a valid email address." }).optional(),
}); 