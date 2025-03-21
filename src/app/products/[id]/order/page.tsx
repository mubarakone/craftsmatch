import { redirect } from "next/navigation";

import { OrderForm } from "@/components/orders/order-form";
import { SampleRequestForm } from "@/components/orders/sample-request-form";
import { getSession, requireAuth } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema/products";
import { eq } from "drizzle-orm";

export interface OrderPageProps {
  params: {
    id: string;
  };
  searchParams: {
    type?: string;
  };
}

export default async function OrderPage({ params, searchParams }: OrderPageProps) {
  // Make sure user is logged in
  await requireAuth();
  
  const orderType = searchParams.type || "order";
  
  // Fetch the product details
  const product = await db.query.products.findFirst({
    where: eq(products.id, params.id),
  });
  
  if (!product) {
    redirect("/products");
  }
  
  return (
    <div className="container max-w-4xl py-10">
      <div className="flex flex-col space-y-6">
        <div className="border-b pb-4">
          <h1 className="text-3xl font-bold">
            {orderType === "sample" ? "Request Sample" : "Place Your Order"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {orderType === "sample" 
              ? "Request a sample to see and feel the quality before placing a full order" 
              : "Complete your order details below"}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {orderType === "sample" ? (
              <SampleRequestForm productId={params.id} product={product} />
            ) : (
              <OrderForm productId={params.id} product={product} />
            )}
          </div>
          
          <div className="border rounded-lg p-4 h-fit">
            <h3 className="font-medium text-lg mb-3">Order Summary</h3>
            <div className="flex items-center space-x-4 mb-4">
              {product.images && product.images[0] && (
                <div className="w-16 h-16 bg-muted rounded overflow-hidden">
                  <img 
                    src={product.images[0]} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-muted-foreground">
                  {product.craftsman?.businessName || "Craftsman"}
                </p>
              </div>
            </div>
            
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between mb-2">
                <span>Price:</span>
                <span>
                  {orderType === "sample" ? "Varies" : `$${product.price.toFixed(2)}`}
                </span>
              </div>
              {orderType !== "sample" && (
                <>
                  <div className="flex justify-between mb-2">
                    <span>Shipping:</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span>To be calculated</span>
                  </div>
                </>
              )}
            </div>
            
            <div className="mt-6 text-sm text-muted-foreground">
              <p className="mb-2">
                {orderType === "sample" 
                  ? "Sample requests are subject to approval by the craftsman." 
                  : "Your order will be confirmed once the craftsman reviews it."}
              </p>
              <p>
                Estimated delivery will be calculated based on your location and the
                selected shipping method.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 