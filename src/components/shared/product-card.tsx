"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface ProductImage {
  id: string;
  imageUrl: string;
  altText: string | null;
  isMain: boolean;
}

interface Product {
  id: string;
  name: string;
  price: number;
  discountPrice?: number | null;
  craftmanId: string;
  categoryId?: string | null;
  isPublished: boolean;
  slug: string;
  description: string;
  images?: ProductImage[];
  craftsman?: {
    name?: string;
  };
  category?: {
    name?: string;
    slug?: string;
  };
  // Add any other properties needed
}

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  // Find the main image or the first image
  const productImage = product.images && product.images.length > 0
    ? (product.images.find(img => img.isMain) || product.images[0])
    : null;

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsFavorite(!isFavorite);
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-square overflow-hidden">
          {productImage ? (
            <Image
              src={productImage.imageUrl}
              alt={productImage.altText || product.name}
              fill={true}
              className="object-cover transition-transform hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-100">
              <span className="text-gray-400">No image</span>
            </div>
          )}
          <button
            onClick={toggleFavorite}
            className="absolute top-2 right-2 rounded-full bg-white/80 p-1.5 backdrop-blur-sm transition-colors hover:bg-white"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              className={cn(
                "h-4 w-4",
                isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
              )}
            />
          </button>
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              {product.category && (
                <p className="text-sm font-medium text-muted-foreground">
                  {product.category.name}
                </p>
              )}
              <h3 className="font-medium leading-tight">{product.name}</h3>
              {product.craftsman && (
                <p className="text-sm text-muted-foreground">
                  by {product.craftsman.name || 'Unknown Craftsman'}
                </p>
              )}
            </div>
            <div>
              {product.discountPrice ? (
                <div className="text-right">
                  <p className="font-semibold text-red-600">${product.discountPrice.toFixed(2)}</p>
                  <p className="text-sm line-through text-muted-foreground">${product.price.toFixed(2)}</p>
                </div>
              ) : (
                <p className="font-semibold">${product.price.toFixed(2)}</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t p-4">
          <div className="w-full flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {product.isPublished ? 'Available' : 'Coming Soon'}
            </span>
            <span className="text-sm font-medium text-blue-600 hover:text-blue-800">
              View Details
            </span>
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
} 