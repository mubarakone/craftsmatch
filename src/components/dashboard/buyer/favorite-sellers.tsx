"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FavoriteSeller } from "@/lib/dashboard/buyer-queries";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface FavoriteSellersCardProps {
  data: FavoriteSeller[];
  className?: string;
}

export function FavoriteSellersCard({ data, className }: FavoriteSellersCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Favorite Sellers</CardTitle>
        <CardDescription>Sellers you've ordered from the most</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((seller) => (
            <div key={seller.id} className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={seller.image} alt={seller.name} />
                <AvatarFallback>{seller.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{seller.name}</p>
                  <div className="flex items-center">
                    <span className="text-xs text-yellow-500 mr-1">★</span>
                    <span className="text-xs font-medium">{seller.rating.toFixed(1)}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {seller.ordersPlaced} order{seller.ordersPlaced !== 1 ? 's' : ''} placed
                </p>
              </div>
              {seller.ordersPlaced > 10 && (
                <Badge variant="secondary" className="ml-auto">
                  Top Customer
                </Badge>
              )}
            </div>
          ))}
          {data.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              You haven't ordered from any sellers yet.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 