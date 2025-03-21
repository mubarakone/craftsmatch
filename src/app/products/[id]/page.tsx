import { Suspense } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Star, ChevronRight, Heart, Share2, LogIn } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { getProductDetail, getRelatedProducts } from "@/lib/products/detail-queries";
import { ProductCard } from "@/components/product-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/server";

interface ProductDetailPageProps {
  params: {
    id: string;
  };
}

// Define a placeholder product structure to handle the mock DB response
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
  };
  craftsman?: {
    id: string;
    businessName?: string;
    imageUrl?: string;
  };
  images?: Array<{
    url: string;
  }>;
  inventoryItem?: {
    inStock: boolean;
  };
  attributes?: Array<{
    attribute: {
      name: string;
    };
    value: string;
  }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const product = await getProductDetail(params.id) as Product | null;

  // Create supabase client to check auth status
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  // Get user role if authenticated
  let userRole = null;
  if (session) {
    const { data: userData } = await supabase
      .from("users")
      .select("user_role")
      .eq("auth_id", session.user.id)
      .single();
    
    userRole = userData?.user_role;
  }
  
  const isBuilder = userRole === 'builder';

  if (!product) {
    notFound();
  }

  // For mock DB, we'll create a placeholder product
  const mockProduct: Product = product || {
    id: params.id,
    name: "Handcrafted Wooden Table",
    description: "Beautiful handcrafted wooden table made with sustainable materials.",
    price: 499.99,
    compareAtPrice: 599.99,
    categoryId: "furniture",
    category: {
      id: "furniture",
      name: "Furniture"
    },
    craftsman: {
      id: "craftsman-1",
      businessName: "Wood Artisan Workshop",
      imageUrl: ""
    },
    images: [],
    inventoryItem: {
      inStock: true
    },
    attributes: []
  };

  const relatedProducts = await getRelatedProducts(mockProduct.id, mockProduct.categoryId || null, 4) as Product[];

  // Placeholder function for generating business name initials
  const getInitials = (name = "") => name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);

  return (
    <main className="container py-8">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm mb-6">
        <Link href="/marketplace" className="flex items-center text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Marketplace
        </Link>
        {mockProduct.category && (
          <>
            <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
            <Link href={`/search?category=${mockProduct.category.id}`} className="text-gray-500 hover:text-gray-700">
              {mockProduct.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
        <span className="text-gray-900 truncate max-w-[200px]">{mockProduct.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {mockProduct.images && mockProduct.images.length > 0 ? (
              <Image
                src={mockProduct.images[0].url}
                alt={mockProduct.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-200">
                <span className="text-gray-500">No image available</span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {mockProduct.images && mockProduct.images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {mockProduct.images.slice(0, 5).map((image, index) => (
                <div key={index} className="relative aspect-square bg-gray-100 rounded-md overflow-hidden cursor-pointer">
                  <Image
                    src={image.url}
                    alt={`${mockProduct.name} thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{mockProduct.name}</h1>
            <div className="flex items-center mt-2">
              <div className="flex items-center">
                <Star className="h-4 w-4 fill-yellow-400 stroke-yellow-400" />
                <span className="ml-1 text-sm font-medium">4.8</span>
              </div>
              <span className="mx-2 text-gray-300">|</span>
              <span className="text-sm text-gray-500">42 reviews</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold">${mockProduct.price.toFixed(2)}</span>
              {mockProduct.compareAtPrice && (
                <span className="ml-2 line-through text-gray-500">${mockProduct.compareAtPrice.toFixed(2)}</span>
              )}
            </div>
            <div className="flex items-center">
              <Badge variant={mockProduct.inventoryItem?.inStock ? "default" : "destructive"}>
                {mockProduct.inventoryItem?.inStock ? "In Stock" : "Out of Stock"}
              </Badge>
            </div>
          </div>

          {/* Craftsman info */}
          {mockProduct.craftsman && (
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <Avatar className="h-10 w-10">
                <AvatarImage src={mockProduct.craftsman.imageUrl || ""} alt={mockProduct.craftsman.businessName || ""} />
                <AvatarFallback>{getInitials(mockProduct.craftsman.businessName)}</AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <Link href={`/artisans/${mockProduct.craftsman.id}`} className="text-sm font-medium hover:underline">
                  {mockProduct.craftsman.businessName || "Craftsman"}
                </Link>
                <p className="text-xs text-gray-500">Artisan</p>
              </div>
              {session ? (
                <Button variant="outline" size="sm" className="ml-auto">
                  Contact
                </Button>
              ) : (
                <Link href="/auth/sign-in" className="ml-auto">
                  <Button variant="outline" size="sm">
                    Sign in to Contact
                  </Button>
                </Link>
              )}
            </div>
          )}

          <div className="space-y-4">
            {isBuilder ? (
              <Button className="w-full">Add to Cart</Button>
            ) : session ? (
              <Button className="w-full" disabled>Builders Only</Button>
            ) : (
              <Link href="/auth/sign-in" className="w-full">
                <Button className="w-full">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign in to Purchase
                </Button>
              </Link>
            )}
            <div className="flex space-x-2">
              <Button variant="outline" className="flex-1">
                <Heart className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" className="flex-1">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* Product Attributes */}
          {mockProduct.attributes && mockProduct.attributes.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Details</h3>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                {mockProduct.attributes.map((attr, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-gray-500">{attr.attribute.name}:</span>
                    <span>{attr.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Tabs */}
      <div className="mt-12">
        <Tabs defaultValue="description">
          <TabsList className="w-full justify-start border-b rounded-none bg-transparent">
            <TabsTrigger value="description" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
              Description
            </TabsTrigger>
            <TabsTrigger value="specifications" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
              Specifications
            </TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
              Reviews
            </TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="pt-4">
            <div className="prose max-w-none">
              <p>{mockProduct.description}</p>
            </div>
          </TabsContent>
          <TabsContent value="specifications" className="pt-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Product Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 text-sm">
                <div className="flex justify-between pr-4">
                  <span className="text-gray-500">Material:</span>
                  <span>Wood</span>
                </div>
                <div className="flex justify-between pr-4">
                  <span className="text-gray-500">Dimensions:</span>
                  <span>12 x 8 x 2 inches</span>
                </div>
                <div className="flex justify-between pr-4">
                  <span className="text-gray-500">Weight:</span>
                  <span>3 lbs</span>
                </div>
                <div className="flex justify-between pr-4">
                  <span className="text-gray-500">Made in:</span>
                  <span>United States</span>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="pt-4">
            <Suspense fallback={<div>Loading reviews...</div>}>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Customer Reviews</h3>
                    <div className="flex items-center mt-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="h-5 w-5 fill-yellow-400 stroke-yellow-400" />
                        ))}
                      </div>
                      <span className="ml-2 text-sm">Based on 42 reviews</span>
                    </div>
                  </div>
                  <Button>Write a Review</Button>
                </div>

                <Separator />

                {/* Sample Reviews */}
                <div className="space-y-6">
                  {/* Review 1 */}
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">John Doe</span>
                      </div>
                      <span className="text-sm text-gray-500">2 weeks ago</span>
                    </div>
                    <div className="flex mt-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-4 w-4 fill-yellow-400 stroke-yellow-400" />
                      ))}
                    </div>
                    <h4 className="font-medium">Amazing craftsmanship!</h4>
                    <p className="text-gray-600 mt-1">
                      The quality of this product exceeded my expectations. Every detail is perfect, and it's clear a lot of care went into making it.
                    </p>
                  </div>

                  {/* Review 2 */}
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarFallback>JS</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">Jane Smith</span>
                      </div>
                      <span className="text-sm text-gray-500">1 month ago</span>
                    </div>
                    <div className="flex mt-1 mb-2">
                      {[1, 2, 3, 4].map((star) => (
                        <Star key={star} className="h-4 w-4 fill-yellow-400 stroke-yellow-400" />
                      ))}
                      <Star className="h-4 w-4 stroke-yellow-400" />
                    </div>
                    <h4 className="font-medium">Beautiful but small</h4>
                    <p className="text-gray-600 mt-1">
                      The product is beautifully made, but it was smaller than I expected. Check the dimensions carefully before ordering.
                    </p>
                  </div>
                </div>

                <Button variant="outline" className="w-full">Load More Reviews</Button>
              </div>
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Related Products</h2>
            <Link href="/marketplace" className="text-primary hover:underline">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </main>
  );
} 