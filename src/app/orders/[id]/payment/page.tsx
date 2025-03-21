import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { requireAuth } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema/orders";
import { PaymentForm } from "@/components/orders/payment-form";

export interface PaymentPageProps {
  params: {
    id: string;
  };
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  // Make sure user is logged in
  const session = await requireAuth();
  
  // Fetch the order details
  const order = await db.query.orders.findFirst({
    where: eq(orders.id, params.id),
    with: {
      items: {
        with: {
          product: true,
        },
      },
      shipping: true,
    },
  });
  
  if (!order) {
    redirect("/dashboard");
  }
  
  // Ensure the user is the buyer
  if (order.buyerId !== session.user.id) {
    redirect("/dashboard");
  }
  
  return (
    <div className="container max-w-4xl py-10">
      <div className="flex flex-col space-y-6">
        <div className="border-b pb-4">
          <h1 className="text-3xl font-bold">Complete Your Payment</h1>
          <p className="text-muted-foreground mt-2">
            Please complete your payment to finalize your order
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <PaymentForm orderId={params.id} order={order} />
          </div>
          
          <div className="border rounded-lg p-4 h-fit">
            <h3 className="font-medium text-lg mb-3">Order Summary</h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4">
                  {item.product.images && item.product.images[0] && (
                    <div className="w-16 h-16 bg-muted rounded overflow-hidden">
                      <img 
                        src={item.product.images[0]} 
                        alt={item.product.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity} | ${item.unitPrice.toFixed(2)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between mb-2">
                <span>Subtotal:</span>
                <span>${order.totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Shipping:</span>
                <span>${order.shipping ? order.shipping.toFixed(2) : "0.00"}</span>
              </div>
              {order.tax && (
                <div className="flex justify-between mb-2">
                  <span>Tax:</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-medium text-lg">
                <span>Total:</span>
                <span>
                  ${(
                    order.totalPrice + 
                    (order.shipping || 0) + 
                    (order.tax || 0)
                  ).toFixed(2)}
                </span>
              </div>
            </div>
            
            <div className="mt-6 text-sm text-muted-foreground">
              <p>
                Your payment is secured using industry-standard encryption.
                No payment information is stored on our servers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 