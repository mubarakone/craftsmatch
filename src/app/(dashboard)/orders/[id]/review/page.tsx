import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ReviewForm from "@/components/reviews/review-form";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { ClientReviewForm } from "@/components/reviews/client-review-form";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Write a Review | CraftsMatch",
  description: "Share your experience about the order",
};

// Make this page dynamic to avoid static build issues
export const dynamic = 'force-dynamic';

export interface ReviewOrderPageProps {
  params: {
    id: string;
  };
}

export default async function ReviewOrderPage({ params }: ReviewOrderPageProps) {
  try {
    // Get session and redirect if not logged in
    const session = await getSession();
    if (!session || !session.user) {
      redirect(`/sign-in?redirect=/orders/${params.id}/review`);
    }
    
    // In a real app, we would fetch the order and validate it can be reviewed
    // For now, we'll use placeholder data
    const order = {
      id: params.id,
      productId: "product-123",
      sellerId: "seller-123",
      sellerName: "John's Woodwork",
      productName: "Handcrafted Wooden Bowl",
      completedAt: new Date().toISOString(),
      productImage: "/images/product-1.jpg"
    };
    
    // Check if this user is authorized to review this order
    const userCanReview = true; // This would normally check if session.user.id matches the buyer ID

    if (!userCanReview) {
      redirect("/dashboard/orders");
    }

    return (
      <div className="container max-w-3xl py-10">
        <div className="flex flex-col space-y-6">
          <div className="border-b pb-4">
            <h1 className="text-3xl font-bold">Leave a Review</h1>
            <p className="text-muted-foreground mt-2">
              Share your experience with the product and craftsman
            </p>
          </div>
          
          <div className="bg-muted p-4 rounded-lg flex items-center space-x-4">
            {order.productImage && (
              <div className="w-16 h-16 bg-background rounded overflow-hidden">
                <img
                  src={order.productImage}
                  alt={order.productName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <h3 className="font-medium">{order.productName}</h3>
              <p className="text-sm text-muted-foreground">By {order.sellerName}</p>
            </div>
          </div>
          
          <ClientReviewForm
            orderId={order.id}
            productId={order.productId}
            recipientId={order.sellerId}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading review page:", error);
    return notFound();
  }
} 