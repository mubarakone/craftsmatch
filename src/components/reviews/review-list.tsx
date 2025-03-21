"use client";

import { useState } from "react";
import { ReviewWithDetails } from "@/lib/reviews/queries";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import RatingInput from "@/components/reviews/rating-input";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, ThumbsUp, Flag, ChevronDown, ChevronUp } from "lucide-react";
import { respondToReview, reportReview } from "@/lib/reviews/actions";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

interface ReviewListProps {
  reviews: ReviewWithDetails[];
  currentUserId?: string;
  canRespond?: boolean;
  showProductInfo?: boolean;
}

export default function ReviewList({
  reviews,
  currentUserId,
  canRespond = false,
  showProductInfo = false,
}: ReviewListProps) {
  const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({});
  const [responseValues, setResponseValues] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<Record<string, boolean>>({});
  
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No reviews yet.</p>
      </div>
    );
  }
  
  const toggleExpand = (reviewId: string) => {
    setExpandedReviews(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
  };
  
  const handleResponseChange = (reviewId: string, value: string) => {
    setResponseValues(prev => ({
      ...prev,
      [reviewId]: value
    }));
  };
  
  const submitResponse = async (reviewId: string) => {
    const response = responseValues[reviewId];
    if (!response || response.trim() === "") return;
    
    setIsSubmitting(prev => ({ ...prev, [reviewId]: true }));
    
    try {
      const formData = new FormData();
      formData.append("reviewId", reviewId);
      formData.append("response", response);
      
      const result = await respondToReview(formData);
      
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Response Submitted",
          description: "Your response has been added to the review.",
        });
        
        // Clear the response form
        setResponseValues(prev => ({ ...prev, [reviewId]: "" }));
        
        // Refresh the page
        window.location.reload();
      }
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(prev => ({ ...prev, [reviewId]: false }));
    }
  };
  
  const handleReportReview = async (reviewId: string) => {
    const confirmed = window.confirm("Are you sure you want to report this review?");
    if (!confirmed) return;
    
    try {
      const formData = new FormData();
      formData.append("reviewId", reviewId);
      formData.append("reason", "Inappropriate content");
      
      const result = await reportReview(formData);
      
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Review Reported",
          description: "Thank you for helping keep our community safe.",
        });
      }
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        const isExpanded = expandedReviews[review.id] || false;
        const isReviewByCurrentUser = currentUserId === review.reviewerId;
        const canRespondToThisReview = canRespond && currentUserId === review.revieweeId && !review.response;
        
        return (
          <Card key={review.id} className="border">
            <CardHeader className="p-4 pb-0">
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <Avatar>
                    <AvatarImage src={review.reviewer?.avatarUrl || ""} alt={review.reviewer?.fullName || "Reviewer"} />
                    <AvatarFallback>
                      {review.reviewer?.fullName?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h3 className="font-medium">{review.reviewer?.fullName}</h3>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <RatingInput value={review.rating} onChange={() => {}} disabled size="sm" />
                      <span>•</span>
                      <time className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                      </time>
                    </div>
                  </div>
                </div>
                
                {!isReviewByCurrentUser && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7" 
                    onClick={() => handleReportReview(review.id)}
                  >
                    <Flag className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="p-4">
              {showProductInfo && review.product && (
                <div className="mb-3 pb-3 border-b">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 bg-muted rounded overflow-hidden">
                      {review.product.images && review.product.images[0] && (
                        <img 
                          src={review.product.images[0]} 
                          alt={review.product.name} 
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <span className="text-sm font-medium">{review.product.name}</span>
                  </div>
                </div>
              )}
              
              {review.title && (
                <h4 className="font-medium mb-2">{review.title}</h4>
              )}
              
              <div className="text-sm">
                {isExpanded || review.content.length < 200 
                  ? review.content 
                  : `${review.content.slice(0, 200)}...`}
              </div>
              
              {review.content.length > 200 && (
                <Button 
                  variant="link" 
                  className="h-auto p-0 mt-2" 
                  onClick={() => toggleExpand(review.id)}
                >
                  {isExpanded ? (
                    <div className="flex items-center text-sm">
                      Show less <ChevronUp className="h-4 w-4 ml-1" />
                    </div>
                  ) : (
                    <div className="flex items-center text-sm">
                      Read more <ChevronDown className="h-4 w-4 ml-1" />
                    </div>
                  )}
                </Button>
              )}
              
              {/* Seller's response */}
              {review.response && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex gap-3 items-start">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={review.reviewee?.avatarUrl || ""} alt={review.reviewee?.fullName || "Seller"} />
                      <AvatarFallback>
                        {review.reviewee?.fullName?.[0] || "S"}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="text-sm font-medium">
                          Response from {review.reviewee?.fullName}
                        </h4>
                        <time className="text-xs text-muted-foreground">
                          {review.responseDate && formatDistanceToNow(new Date(review.responseDate), { addSuffix: true })}
                        </time>
                      </div>
                      <p className="text-sm mt-1">{review.response}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="p-4 pt-0 flex flex-col space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="h-7">
                    <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                    Helpful
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7">
                    <MessageSquare className="h-3.5 w-3.5 mr-1" />
                    Comment
                  </Button>
                </div>
              </div>
              
              {canRespondToThisReview && (
                <div className="w-full pt-3">
                  <Separator className="mb-3" />
                  <h4 className="text-sm font-medium mb-2">Respond to this review</h4>
                  <Textarea
                    placeholder="Write your response..."
                    value={responseValues[review.id] || ""}
                    onChange={(e) => handleResponseChange(review.id, e.target.value)}
                    className="min-h-[80px] mb-2"
                    disabled={isSubmitting[review.id]}
                  />
                  <Button 
                    size="sm" 
                    onClick={() => submitResponse(review.id)}
                    disabled={isSubmitting[review.id] || !responseValues[review.id]}
                  >
                    {isSubmitting[review.id] ? "Submitting..." : "Submit Response"}
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
} 