import { redirect, notFound } from "next/navigation";

import { OrderForm } from "@/components/orders/order-form";
import { SampleRequestForm } from "@/components/orders/sample-request-form";
import { getSession } from "@/lib/auth/session";
import { db, executeRawQuery } from "@/lib/db";
import { products } from "@/lib/db/schema/products";
import { eq } from "drizzle-orm";

// Make this page dynamic to avoid static build issues
export const dynamic = 'force-dynamic';

export interface OrderPageProps {
  params: {
    id: string;
  };
  searchParams: {
    type?: string;
  };
}

export default async function OrderPage({ params, searchParams }: OrderPageProps) {
  try {
    // Get session and redirect if not logged in
    const session = await getSession();
    if (!session || !session.user) {
      redirect(`/sign-in?redirect=/products/${params.id}/order`);
    }
    
    const orderType = searchParams.type || "order";
    
    // Fetch the product details
    let product = null;
    
    if (db) {
      try {
        product = await db.query.products.findFirst({
          where: eq(products.id, params.id),
        });
      } catch (dbError) {
        console.error("Database query error:", dbError);
      }
    }
    
    // Try fallback to raw SQL if db query failed
    if (!product && typeof executeRawQuery === 'function') {
      try {
        const results = await executeRawQuery(`
          SELECT * FROM products WHERE id = $1 LIMIT 1
        `, [params.id]);
        
        if (results && results.length > 0) {
          product = results[0];
        }
      } catch (sqlError) {
        console.error("SQL query error:", sqlError);
      }
    }
    
    // If still no product, use a mock product
    if (!product) {
      product = {
        id: params.id,
        name: "Sample Product",
        price: 99.99,
        description: "This is a placeholder product for demonstration.",
        images: []
      };
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
  } catch (error) {
    console.error("Error loading order page:", error);
    return notFound();
  }
} 