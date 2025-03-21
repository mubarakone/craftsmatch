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
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {/* Rating */}
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Rating</FormLabel>
                  <FormControl>
                    <RatingInput
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isSubmitting}
                      size="lg"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Review Title (Optional) */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Review Title (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      placeholder="Summarize your experience"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Review Content */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Review</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Share details about your experience..."
                      className="min-h-[120px]"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Public Review Option */}
            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Make this review public</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Your review will be visible to other users on the platform
                    </p>
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
          
          <CardFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
} 