"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    compareAtPrice?: number;
    images?: { url: string }[];
    craftsman?: {
      businessName?: string;
    };
    category?: {
      name: string;
    };
  };
  variant?: "default" | "compact";
}

export function ProductCard({ product, variant = "default" }: ProductCardProps) {
  const isOnSale = product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <Card className="group overflow-hidden">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0].url}
              alt={product.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gray-200">
              <span className="text-gray-500">No image</span>
            </div>
          )}
          
          <Button 
            size="icon" 
            variant="ghost" 
            className="absolute right-2 top-2 h-8 w-8 rounded-full bg-white opacity-70 hover:opacity-100"
          >
            <Heart className="h-4 w-4" />
            <span className="sr-only">Add to wishlist</span>
          </Button>
          
          {isOnSale && (
            <Badge className="absolute left-2 top-2" variant="destructive">
              Sale
            </Badge>
          )}
        </div>
      </Link>
      
      <CardContent className={variant === "compact" ? "p-2" : "p-4"}>
        <div className="space-y-1">
          {product.category && (
            <div className="text-xs text-gray-500">{product.category.name}</div>
          )}
          
          <Link href={`/products/${product.id}`} className="block">
            <h3 className="font-medium leading-tight line-clamp-2 hover:underline">
              {product.name}
            </h3>
          </Link>
          
          {product.craftsman?.businessName && (
            <div className="text-xs text-gray-500">
              By {product.craftsman.businessName}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className={variant === "compact" ? "p-2 pt-0" : "p-4 pt-0"}>
        <div className="flex items-center justify-between w-full">
          <div>
            <span className="font-medium">${product.price.toFixed(2)}</span>
            {isOnSale && (
              <span className="ml-2 text-sm text-gray-500 line-through">
                ${product.compareAtPrice?.toFixed(2)}
              </span>
            )}
          </div>
          
          <Button size="sm" variant="outline">
            View
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
} 