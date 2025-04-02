import { format } from "date-fns";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ReviewItemProps {
  review: {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    product: {
      name: string;
      imageUrl?: string;
    };
    reviewer: {
      fullName: string;
      avatarUrl?: string;
    };
  };
  viewMode: "buyer" | "seller";
}

export function ReviewItem({ review, viewMode }: ReviewItemProps) {
  const formattedDate = format(new Date(review.createdAt), "MMM d, yyyy");
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={review.reviewer.avatarUrl} />
              <AvatarFallback>
                {review.reviewer.fullName?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{review.reviewer.fullName}</div>
              <div className="text-sm text-muted-foreground">
                {formattedDate}
              </div>
            </div>
          </div>
          <Badge variant="secondary">
            {viewMode === "buyer" ? "Received" : "Written"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < review.rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-gray-200 text-gray-200"
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground mb-2">
          Review for: {review.product.name}
        </p>
        <p className="whitespace-pre-wrap">{review.comment}</p>
      </CardContent>
    </Card>
  );
} 