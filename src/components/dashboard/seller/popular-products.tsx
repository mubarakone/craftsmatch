"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PopularProduct } from "@/lib/dashboard/seller-queries";
import { formatCurrency } from "@/lib/charts/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface PopularProductsCardProps {
  data: PopularProduct[];
  className?: string;
}

export function PopularProductsCard({ data, className }: PopularProductsCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Popular Products</CardTitle>
        <CardDescription>Your best-selling items</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.length > 0 ? (
            data.map((product) => (
              <div key={product.id} className="flex items-start space-x-4 border-b pb-4 last:border-0 last:pb-0">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={product.image} alt={product.name} />
                  <AvatarFallback>{product.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{product.name}</p>
                    {product.stock < 10 && (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        Low Stock: {product.stock}
                      </Badge>
                    )}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Orders: {product.orders}</span>
                    <span>Revenue: {formatCurrency(product.revenue)}</span>
                  </div>
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-1.5 text-xs flex rounded bg-muted">
                      <div
                        style={{ width: `${Math.min(100, (product.orders / data[0].orders) * 100)}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">No products data available.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 