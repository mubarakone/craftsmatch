"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { reviewSchema } from "@/lib/validators/review";
import { submitReview } from "@/lib/reviews/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import RatingInput from "@/components/reviews/rating-input";
import { toast } from "@/components/ui/use-toast";
import { Star } from "lucide-react";

// Create a simplified schema type for the form
type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  orderId: string;
  productId: string;
  revieweeId: string;
  productName: string;
  revieweeName: string;
}

export default function ReviewForm({
  orderId,
  productId,
  revieweeId,
  productName,
  revieweeName,
}: ReviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Initialize the form with default values
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      orderId,
      productId,
      revieweeId,
      rating: 5,
      content: "",
      isPublic: true,
    },
  });

  // Form submission handler
  const onSubmit = async (data: ReviewFormValues) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("orderId", data.orderId);
      formData.append("productId", data.productId);
      formData.append("revieweeId", data.revieweeId);
      formData.append("rating", data.rating.toString());
      
      if (data.title) {
        formData.append("title", data.title);
      }
      
      formData.append("content", data.content);
      formData.append("isPublic", data.isPublic.toString());
      
      // Handle images if present
      if (data.images && data.images.length > 0) {
        formData.append("images", JSON.stringify(data.images));
      }

      const result = await submitReview(formData);

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Review Submitted",
          description: "Thank you for sharing your experience!",
        });
        
        // Navigate back to order details
        router.push(`/dashboard/orders/${orderId}`);
        router.refresh();
      }
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
        <CardDescription>
          Share your experience with {revieweeName} about {productName}
        </CardDescription>
      </CardHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    const input = document.getElementById("rating") as HTMLInputElement;
                    if (input) {
                      input.value = value.toString();
                      input.dispatchEvent(new Event("change"));
                    }
                  }}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 ${
                      value <= Number(document.getElementById("rating")?.value || 0)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-200 text-gray-200"
                    }`}
                  />
                </button>
              ))}
            </div>
            <input type="hidden" id="rating" name="rating" value="0" />
          </div>
          
          <div>
            <label htmlFor="comment" className="block text-sm font-medium mb-2">
              Your Review
            </label>
            <Textarea
              id="comment"
              name="comment"
              placeholder="Share your experience with the product and craftsman..."
              className="min-h-[120px]"
              required
            />
          </div>
          
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      </Form>
    </Card>
  );
} 