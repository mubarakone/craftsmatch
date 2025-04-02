import { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getUserWrittenReviews, getUserReceivedReviews } from "@/lib/reviews/queries";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ReviewItem } from "@/components/reviews/review-item";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Reviews | CraftsMatch",
  description: "Manage your reviews and feedback",
};

// Make this page dynamic to avoid static build issues
export const dynamic = 'force-dynamic';

// Loading skeleton component for reviews
function ReviewsLoading() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
              <Skeleton className="h-4 w-12" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Container components to handle data fetching
async function WrittenReviewsContainer({ userId }: { userId: string }) {
  const reviews = await getUserWrittenReviews(userId);
  
  return (
    <div className="space-y-4">
      {reviews.length > 0 ? (
        reviews.map((review) => (
          <ReviewItem key={review.id} review={review} viewMode="seller" />
        ))
      ) : (
        <Card>
          <CardContent className="pt-6 pb-6">
            <p className="text-center text-gray-500">You haven't written any reviews yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

async function ReceivedReviewsContainer({ userId }: { userId: string }) {
  const reviews = await getUserReceivedReviews(userId);
  
  return (
    <div className="space-y-4">
      {reviews.length > 0 ? (
        reviews.map((review) => (
          <ReviewItem key={review.id} review={review} viewMode="buyer" />
        ))
      ) : (
        <Card>
          <CardContent className="pt-6 pb-6">
            <p className="text-center text-gray-500">You haven't received any reviews yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default async function ReviewsPage() {
  try {
    // Get session and redirect if not logged in
    const session = await getSession();
    if (!session || !session.user) {
      redirect("/sign-in?redirect=/reviews");
    }
    
    const userId = session.user.id;
    
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Reviews</h1>
        
        <Tabs defaultValue="received" className="space-y-4">
          <TabsList>
            <TabsTrigger value="received">Reviews Received</TabsTrigger>
            <TabsTrigger value="written">Reviews Written</TabsTrigger>
          </TabsList>
          
          <TabsContent value="received" className="space-y-4">
            <Suspense fallback={<ReviewsLoading />}>
              <ReceivedReviewsContainer userId={userId} />
            </Suspense>
          </TabsContent>
          
          <TabsContent value="written" className="space-y-4">
            <Suspense fallback={<ReviewsLoading />}>
              <WrittenReviewsContainer userId={userId} />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    );
  } catch (error) {
    console.error("Error loading reviews page:", error);
    return notFound();
  }
} 