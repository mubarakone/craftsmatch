import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProductById } from "@/lib/products/queries";
import { formatCurrency } from "@/lib/utils";
import { requireAuth } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Manage Product",
  description: "View and manage your product as a seller",
};

export default async function ManageProductPage({ params }: { params: { id: string } }) {
  const session = await requireAuth();
  const product = await getProductById(params.id);

  if (!product || product.craftmanId !== session.user.id) {
    notFound();
  }

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Link href="/products">
            <Button variant="ghost" size="sm" className="gap-1">
              <ChevronLeft className="h-4 w-4" />
              Back to Products
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          {product.isPublished ? (
            <div className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">Published</div>
          ) : (
            <div className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">Draft</div>
          )}
        </div>
        <Link href={`/products/${product.id}/edit`}>
          <Button className="gap-2">
            <Pencil className="h-4 w-4" />
            Edit Product
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Product Images */}
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
            </CardHeader>
            <CardContent>
              {product.images && product.images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {product.images.map((image, index) => (
                    <div key={image.id} className="relative aspect-square rounded-md overflow-hidden border">
                      <Image
                        src={image.imageUrl}
                        alt={image.altText || `Product image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No images available</p>
              )}
            </CardContent>
          </Card>

          {/* Product Details */}
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                <p className="mt-1">{product.description || "No description provided"}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">SKU</h3>
                  <p className="mt-1">{product.inventory?.sku || "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Category</h3>
                  <p className="mt-1">{"Category #" + product.categoryId || "Uncategorized"}</p>
                </div>
              </div>

              {/* Specifications */}
              {(product.dimensions || product.weight || product.material || product.color) && (
                <>
                  <hr className="my-4 border-t border-border" />
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Specifications</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {product.dimensions && (
                        <div>
                          <h4 className="text-sm font-medium">Dimensions</h4>
                          <p className="text-sm">{product.dimensions}</p>
                        </div>
                      )}
                      {product.weight && (
                        <div>
                          <h4 className="text-sm font-medium">Weight</h4>
                          <p className="text-sm">{product.weight} {product.weightUnit || 'kg'}</p>
                        </div>
                      )}
                      {product.material && (
                        <div>
                          <h4 className="text-sm font-medium">Material</h4>
                          <p className="text-sm">{product.material}</p>
                        </div>
                      )}
                      {product.color && (
                        <div>
                          <h4 className="text-sm font-medium">Color</h4>
                          <p className="text-sm">{product.color}</p>
                        </div>
                      )}
                      {product.leadTime && (
                        <div>
                          <h4 className="text-sm font-medium">Lead Time</h4>
                          <p className="text-sm">{product.leadTime} days</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {product.attributes && product.attributes.length > 0 && (
                <>
                  <hr className="my-4 border-t border-border" />
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Attributes</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {product.attributes.map((attr) => (
                        <div key={attr.id}>
                          <h4 className="text-sm font-medium">{attr.attributeName}</h4>
                          <p className="text-sm">{attr.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Price</h3>
                <p className="text-xl font-bold mt-1">
                  {formatCurrency(product.price || 0, product.currency || "USD")}
                </p>
                {product.discountPrice && (
                  <div className="flex items-center mt-1">
                    <p className="text-sm line-through text-muted-foreground mr-2">
                      {formatCurrency(product.price || 0, product.currency || "USD")}
                    </p>
                    <p className="text-sm font-medium text-green-600">
                      {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% off
                    </p>
                  </div>
                )}
              </div>
              
              <hr className="my-4 border-t border-border" />
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Inventory</h3>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Quantity</p>
                    <p className="font-medium">{product.inventory?.quantity !== undefined ? product.inventory.quantity : "Unlimited"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Low Stock Alert</p>
                    <p className="font-medium">{product.inventory?.lowStockThreshold || "None"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Shipping Information</h3>
                <p className="mt-1 text-muted-foreground">View shipping details in the edit page</p>
              </div>
              
              {product.leadTime && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Processing Time</h3>
                  <p className="mt-1">{product.leadTime} days</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 