import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ReviewForm from "@/components/reviews/review-form";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Write a Review | CraftsMatch",
  description: "Share your experience about the order",
};

interface ReviewPageProps {
  params: {
    id: string;
  };
}

// Define types for the Supabase response
interface OrderResponse {
  id: string;
  status: string;
  sellerId: string;
  seller: {
    id: string;
    fullName: string;
  };
  product: {
    id: string;
    name: string;
  };
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { id: orderId } = params;
  
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect("/sign-in");
  }
  
  const currentUserId = session.user.id;
  
  // Fetch order details
  const { data: order, error } = await supabase
    .from("orders")
    .select(`
      id,
      status,
      sellerId,
      seller:sellerId(id, fullName),
      product:productId(id, name)
    `)
    .eq("id", orderId)
    .eq("buyerId", currentUserId)
    .single();
  
  if (error || !order) {
    notFound();
  }
  
  // Properly type the order
  const typedOrder = order as unknown as OrderResponse;
  
  // Check if order is completed
  if (typedOrder.status !== "completed") {
    redirect(`/dashboard/orders/${orderId}`);
  }
  
  // Check if already reviewed
  const { data: existingReview } = await supabase
    .from("reviews")
    .select("id")
    .eq("orderId", orderId)
    .eq("reviewerId", currentUserId)
    .maybeSingle();
  
  if (existingReview) {
    redirect(`/dashboard/orders/${orderId}?reviewed=true`);
  }
  
  return (
    <div className="container py-6">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-2">
          <Link href={`/dashboard/orders/${orderId}`}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Order
          </Link>
        </Button>
        
        <h1 className="text-3xl font-bold tracking-tight">Write a Review</h1>
        <p className="text-muted-foreground">
          Share your experience with this order
        </p>
      </div>
      
      <div className="max-w-2xl mx-auto">
        <ReviewForm
          orderId={orderId}
          productId={typedOrder.product.id}
          revieweeId={typedOrder.sellerId}
          productName={typedOrder.product.name}
          revieweeName={typedOrder.seller.fullName}
        />
      </div>
    </div>
  );
} 