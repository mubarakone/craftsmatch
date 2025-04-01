import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/supabase/server";
import { getUserWrittenReviews, getUserReceivedReviews } from "@/lib/reviews/queries";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ReviewList from "@/components/reviews/review-list";
import { fetchWithFallback } from "@/lib/db";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Reviews | CraftsMatch",
  description: "Manage your reviews and feedback",
};

// Add dynamic configuration to prevent static build
export const dynamic = 'force-dynamic';

// Loading state component for reviews
function ReviewsLoading() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="border rounded-md p-4">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse mr-3"></div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
            </div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        </div>
      ))}
    </div>
  );
}

export default async function ReviewsPage() {
  // Skip authentication check during build
  if (process.env.NEXT_BUILD === 'true') {
    return renderReviewsPage('build-time-user-id', [], []);
  }
  
  // Regular runtime authentication
  const session = await getSession();
  
  if (!session) {
    redirect("/sign-in");
  }
  
  const currentUserId = session.user.id;
  
  // Fetch reviews with fallback for errors
  const writtenReviews = await fetchWithFallback(
    () => getUserWrittenReviews(currentUserId),
    []
  );
  
  const receivedReviews = await fetchWithFallback(
    () => getUserReceivedReviews(currentUserId),
    []
  );
  
  return renderReviewsPage(currentUserId, writtenReviews, receivedReviews);
}

// Separate rendering function to avoid duplication
function renderReviewsPage(currentUserId: string, writtenReviews: any[], receivedReviews: any[]) {
  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
        <p className="text-muted-foreground">
          Manage and view your reviews
        </p>
      </div>
      
      <Tabs defaultValue="received" className="space-y-4">
        <TabsList>
          <TabsTrigger value="received">Reviews Received</TabsTrigger>
          <TabsTrigger value="written">Reviews Written</TabsTrigger>
        </TabsList>
        
        <TabsContent value="received" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reviews You've Received</CardTitle>
              <CardDescription>
                See what others think about your products and services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<ReviewsLoading />}>
                <ReviewList 
                  reviews={receivedReviews} 
                  currentUserId={currentUserId}
                  canRespond={true}
                  showProductInfo={true}
                />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="written" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reviews You've Written</CardTitle>
              <CardDescription>
                Manage the reviews you've left for products and services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<ReviewsLoading />}>
                <ReviewList 
                  reviews={writtenReviews} 
                  currentUserId={currentUserId}
                  showProductInfo={true}
                />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 