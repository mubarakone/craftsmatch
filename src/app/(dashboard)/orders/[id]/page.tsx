import { redirect, notFound } from "next/navigation";
import { format } from "date-fns";

import { getSession } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { OrderTimeline } from "@/components/orders/order-timeline";
import { OrderStatus } from "@/components/orders/order-status";
import { ClientTrackingInfo } from "@/components/orders/client-tracking-info";
import { ClientRevisionForm } from "@/components/orders/client-revision-form";

// Make this page dynamic to avoid static build issues
export const dynamic = 'force-dynamic';

export interface OrderDetailsPageProps {
  params: {
    id: string;
  };
}

export default async function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  try {
    // Get session - redirect to login if not authenticated
    const session = await getSession();
    if (!session || !session.user) {
      redirect("/sign-in?redirect=/orders/" + params.id);
    }

    // Mock order data for demonstration
    const order = {
      id: params.id,
      orderNumber: "ORD-" + params.id.substring(0, 6),
      status: "processing",
      createdAt: new Date().toISOString(),
      totalPrice: 129.99,
      shipping: 9.99,
      tax: 10.50,
      buyerId: session.user.id,
      sellerId: "seller-123",
      items: [
        {
          id: "item-1",
          productId: "prod-1",
          quantity: 1,
          unitPrice: 129.99,
          customizations: {
            color: "Natural Wood",
            engraving: "Happy Anniversary"
          },
          product: {
            id: "prod-1",
            name: "Handcrafted Wooden Bowl",
            description: "A beautiful handcrafted wooden bowl",
            images: ["/images/product-1.jpg"]
          }
        }
      ],
      shippingInfo: {
        recipientName: "John Doe",
        addressLine1: "123 Main St",
        addressLine2: "Apt 4B",
        city: "Anytown",
        state: "CA",
        zipCode: "12345",
        country: "United States",
        phoneNumber: "+1 555-123-4567",
        shippingMethod: "standard",
        trackingNumber: "USPS12345678901",
        shippingCarrier: "usps",
        shippingStatus: "in_transit",
        specialInstructions: "Leave at the front door"
      },
      seller: {
        id: "seller-123",
        name: "John's Woodwork",
        email: "john@woodwork.com"
      },
      buyer: {
        id: session.user.id,
        name: session.user?.email?.split('@')[0] || "Customer",
        email: session.user.email || "customer@example.com"
      },
      revisions: [],
      notes: "Please wrap as a gift."
    };

    // Ensure the user is either the buyer or seller
    const isBuyer = order.buyerId === session.user.id;
    const isSeller = order.sellerId === session.user.id;

    if (!isBuyer && !isSeller) {
      redirect("/dashboard/orders");
    }

    // Determine if the user can request revisions
    const canRequestRevision = isBuyer && order.status === "completed";

    // Format date
    const orderDate = format(new Date(order.createdAt), "MMM d, yyyy");

    // Get status color
    const getStatusColor = (status: string) => {
      switch (status) {
        case "pending":
          return "bg-yellow-100 text-yellow-800";
        case "processing":
          return "bg-blue-100 text-blue-800";
        case "completed":
          return "bg-green-100 text-green-800";
        case "cancelled":
          return "bg-red-100 text-red-800";
        case "refunded":
          return "bg-purple-100 text-purple-800";
        case "in_revision":
          return "bg-orange-100 text-orange-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };

    return (
      <div className="container py-10">
        <div className="flex flex-col space-y-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Order Details</h1>
              <p className="text-muted-foreground mt-2">
                Order #{order.orderNumber} • Placed on {orderDate}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Badge className={getStatusColor(order.status)}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace("_", " ")}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex flex-col md:flex-row md:items-start gap-4">
                        {item.product.images && item.product.images[0] && (
                          <div className="w-24 h-24 bg-muted rounded overflow-hidden">
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-medium">{item.product.name}</h3>
                          <div className="mt-1 text-sm text-muted-foreground">
                            <p>Quantity: {item.quantity}</p>
                            <p>Unit Price: ${item.unitPrice.toFixed(2)}</p>
                            {item.customizations && Object.keys(item.customizations).length > 0 && (
                              <div className="mt-2">
                                <p className="font-medium">Customizations:</p>
                                <ul className="list-disc list-inside">
                                  {Object.entries(item.customizations).map(([key, value]) => (
                                    <li key={key}>
                                      {key}: {value}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-medium">
                            ${(item.quantity * item.unitPrice).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <div className="flex justify-between mb-2">
                      <span>Subtotal:</span>
                      <span>${order.totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Shipping:</span>
                      <span>${(typeof order.shipping === 'number' ? order.shipping : 0).toFixed(2)}</span>
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
                          (typeof order.shipping === 'number' ? order.shipping : 0) +
                          (order.tax || 0)
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <OrderStatus status={order.status} />
                  <OrderTimeline order={order} />
                </CardContent>
              </Card>

              {/* Shipping Information */}
              {order.shippingInfo && (
                <Card>
                  <CardHeader>
                    <CardTitle>Shipping Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-medium mb-2">Shipping Address</h3>
                        <div className="text-sm">
                          <p>{order.shippingInfo.recipientName}</p>
                          <p>{order.shippingInfo.addressLine1}</p>
                          {order.shippingInfo.addressLine2 && <p>{order.shippingInfo.addressLine2}</p>}
                          <p>
                            {order.shippingInfo.city}, {order.shippingInfo.state} {order.shippingInfo.zipCode}
                          </p>
                          <p>{order.shippingInfo.country}</p>
                          {order.shippingInfo.phoneNumber && <p>Phone: {order.shippingInfo.phoneNumber}</p>}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium mb-2">Shipping Method</h3>
                        <div className="text-sm">
                          <p>
                            {order.shippingInfo.shippingMethod &&
                              order.shippingInfo.shippingMethod.charAt(0).toUpperCase() +
                                order.shippingInfo.shippingMethod.slice(1)}{" "}
                            Shipping
                          </p>
                          {order.shippingInfo.specialInstructions && (
                            <div className="mt-2">
                              <p className="font-medium">Special Instructions:</p>
                              <p className="text-muted-foreground">
                                {order.shippingInfo.specialInstructions}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {order.shippingInfo.trackingNumber && (
                      <div className="mt-6">
                        <ClientTrackingInfo
                          trackingNumber={order.shippingInfo.trackingNumber}
                          carrier={order.shippingInfo.shippingCarrier}
                          status={order.shippingInfo.shippingStatus}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Request Revision Form */}
              {canRequestRevision && (
                <Card>
                  <CardHeader>
                    <CardTitle>Request a Revision</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ClientRevisionForm orderId={params.id} />
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>{isBuyer ? "Seller" : "Buyer"} Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium">
                      {isBuyer ? order.seller.name : order.buyer.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isBuyer ? order.seller.email : order.buyer.email}
                    </p>
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" className="w-full">
                      Contact {isBuyer ? "Seller" : "Buyer"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Notes */}
              {order.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Order Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{order.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading order details:", error);
    return notFound();
  }
} 