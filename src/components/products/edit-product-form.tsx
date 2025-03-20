"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { updateProduct, toggleProductPublished } from "@/lib/products/actions";
import { ProductDetailsData, ProductImagesData, ProductPricingData, ProductShippingData, ProductAttributesData } from "@/lib/products/actions";
import ProductDetailsForm from "./product-details-form";
import ProductImagesForm from "./product-images-form";
import ProductPricingForm from "./product-pricing-form";
import ProductShippingForm from "./product-shipping-form";
import AttributeFields from "./attribute-fields";

interface ProductData {
  id: string;
  name: string;
  description: string;
  categoryId: string | null;
  isCustomizable: boolean;
  dimensions: string | null;
  weight: number | null;
  weightUnit: string | null;
  material: string | null;
  color: string | null;
  leadTime: number | null;
  price: number;
  discountPrice: number | null;
  currency: string;
  isPublished: boolean;
  images: Array<{
    id: string;
    imageUrl: string;
    altText: string | null;
    displayOrder: number;
    isMain: boolean;
  }>;
  inventory: {
    sku: string | null;
    quantity: number;
    reservedQuantity: number;
    lowStockThreshold: number | null;
  } | null;
  attributes?: Array<{ attributeId: string; value: string }>;
}

interface EditProductFormProps {
  product: ProductData;
}

type ProductFormData = {
  name: string;
  description: string;
  categoryId: string;
  isPublished: boolean;
  price: number;
  compareAtPrice: number | null;
  costPerItem: number | null;
  sku: string;
  barcode: string;
  quantity: number;
  weight: number;
  length: number;
  width: number;
  height: number;
  requiresShipping: boolean;
  attributes: Record<string, string | string[]>;
  images: string[];
}

export default function EditProductForm({ product }: EditProductFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("details");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  
  // Store form data for each step
  const [detailsData, setDetailsData] = useState<Partial<ProductDetailsData>>({});
  const [imagesData, setImagesData] = useState<ProductImagesData | null>(null);
  const [pricingData, setPricingData] = useState<Partial<ProductPricingData>>({});
  const [shippingData, setShippingData] = useState<Partial<ProductShippingData>>({});
  const [attributesData, setAttributesData] = useState<ProductAttributesData | null>(null);

  const handleDetailsComplete = (data: ProductDetailsData) => {
    setDetailsData(data);
    setActiveTab("images");
  };

  const handleImagesComplete = (data: ProductImagesData) => {
    setImagesData(data);
    setActiveTab("pricing");
  };

  const handlePricingComplete = (data: ProductPricingData) => {
    setPricingData(data);
    setActiveTab("shipping");
  };

  const handleShippingComplete = (data: ProductShippingData) => {
    setShippingData(data);
    setActiveTab("attributes");
  };

  const handleAttributesChange = (attributes: Array<{ attributeId: string; value: string }>) => {
    setAttributesData({ attributes });
  };

  const handleAttributeChange = (attributes: Record<string, string | string[]>) => {
    setAttributesData({ attributes });
  };

  const handleSaveProduct = async () => {
    setIsUpdating(true);
    
    try {
      // Prepare data for update
      const updateData: any = {};
      
      if (Object.keys(detailsData).length > 0) {
        updateData.details = detailsData;
      }
      
      if (imagesData) {
        updateData.images = imagesData;
      }
      
      if (Object.keys(pricingData).length > 0) {
        updateData.pricing = pricingData;
      }
      
      if (Object.keys(shippingData).length > 0) {
        updateData.shipping = shippingData;
      }
      
      if (attributesData) {
        updateData.attributes = attributesData;
      }
      
      // Only update if we have changes
      if (Object.keys(updateData).length === 0) {
        toast({
          title: "No changes to save",
          description: "Make some changes first before saving.",
          variant: "default",
        });
        setIsUpdating(false);
        return;
      }
      
      const result = await updateProduct(product.id, updateData);
      
      if (result.success) {
        toast({
          title: "Product updated",
          description: "Your product has been updated successfully.",
          variant: "default",
        });
        router.refresh();
      } else {
        toast({
          title: "Failed to update product",
          description: result.error || "An error occurred while updating your product.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTogglePublish = async () => {
    setIsPublishing(true);
    
    try {
      const result = await toggleProductPublished(product.id);
      
      if (result.success) {
        toast({
          title: result.published ? "Product published" : "Product unpublished",
          description: result.published 
            ? "Your product is now visible to customers." 
            : "Your product has been unpublished and is no longer visible to customers.",
          variant: "default",
        });
        router.refresh();
      } else {
        toast({
          title: "Failed to update product status",
          description: result.error || "An error occurred while updating your product status.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error toggling product status:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };
  
  // Prepare initial data for forms
  const initialDetails: ProductDetailsData = {
    name: product.name,
    description: product.description,
    categoryId: product.categoryId || "",
    isCustomizable: product.isCustomizable,
    dimensions: product.dimensions || undefined,
    weight: product.weight || undefined,
    weightUnit: product.weightUnit || undefined,
    material: product.material || undefined,
    color: product.color || undefined,
    leadTime: product.leadTime || undefined,
  };
  
  const initialImages: ProductImagesData = {
    images: product.images.map(img => ({
      imageUrl: img.imageUrl,
      altText: img.altText || undefined,
      displayOrder: img.displayOrder,
      isMain: img.isMain,
    })),
  };
  
  const initialPricing: ProductPricingData = {
    price: product.price,
    discountPrice: product.discountPrice || undefined,
    currency: product.currency,
    sku: product.inventory?.sku || undefined,
    quantity: product.inventory?.quantity || 0,
    lowStockThreshold: product.inventory?.lowStockThreshold || undefined,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Edit Product</h1>
          <p className="text-sm text-muted-foreground">
            Update your product information and settings
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleTogglePublish}
            variant={product.isPublished ? "outline" : "default"}
            disabled={isPublishing}
          >
            {isPublishing
              ? "Updating..."
              : product.isPublished
              ? "Unpublish"
              : "Publish"}
          </Button>
          <Button onClick={handleSaveProduct} disabled={isUpdating}>
            {isUpdating ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="attributes">Attributes</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="details">
            <ProductDetailsForm
              onComplete={handleDetailsComplete}
              initialData={initialDetails}
              submitLabel="Save & Continue"
            />
          </TabsContent>
          
          <TabsContent value="images">
            <ProductImagesForm
              onComplete={handleImagesComplete}
              initialData={initialImages}
              submitLabel="Save & Continue"
            />
          </TabsContent>
          
          <TabsContent value="pricing">
            <ProductPricingForm
              onComplete={handlePricingComplete}
              initialData={initialPricing}
              submitLabel="Save & Continue"
            />
          </TabsContent>
          
          <TabsContent value="shipping">
            <ProductShippingForm
              onComplete={handleShippingComplete}
              submitLabel="Save & Continue"
            />
          </TabsContent>
          
          <TabsContent value="attributes">
            <Card>
              <CardContent className="pt-6">
                <AttributeFields
                  categoryId={product.categoryId}
                  onAttributesChange={handleAttributesChange}
                  initialValues={product.attributes}
                />
                
                <div className="flex justify-end mt-6 space-x-2">
                  <Button onClick={handleSaveProduct} disabled={isUpdating}>
                    {isUpdating ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
} 