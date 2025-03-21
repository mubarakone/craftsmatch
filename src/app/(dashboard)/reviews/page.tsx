import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserWrittenReviews, getUserReceivedReviews } from "@/lib/reviews/queries";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ReviewList from "@/components/reviews/review-list";

export const metadata: Metadata = {
  title: "Reviews | CraftsMatch",
  description: "Manage your reviews and feedback",
};

export default async function ReviewsPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect("/sign-in");
  }
  
  const currentUserId = session.user.id;
  const writtenReviews = await getUserWrittenReviews();
  const receivedReviews = await getUserReceivedReviews();
  
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
              <ReviewList 
                reviews={receivedReviews} 
                currentUserId={currentUserId}
                canRespond={true}
                showProductInfo={true}
              />
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
              <ReviewList 
                reviews={writtenReviews} 
                currentUserId={currentUserId}
                showProductInfo={true}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 