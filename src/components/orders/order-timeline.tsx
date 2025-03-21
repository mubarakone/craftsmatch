import React from "react";
import { format } from "date-fns";
import { CheckCircle, Clock, Package, RefreshCw, Truck, X } from "lucide-react";

// This is a simplified type for our example. In a real app, you'd import the actual type
interface Order {
  status: string;
  createdAt: string | Date;
  processedAt?: string | Date;
  shippedAt?: string | Date;
  deliveredAt?: string | Date;
  cancelledAt?: string | Date;
  revisionRequestedAt?: string | Date;
  revisionCompletedAt?: string | Date;
}

interface OrderTimelineProps {
  order: Order;
}

export function OrderTimeline({ order }: OrderTimelineProps) {
  const timelineEvents = [
    {
      label: "Order Placed",
      date: order.createdAt,
      icon: <Clock className="h-5 w-5" />,
      color: "text-gray-500",
      bgColor: "bg-gray-500",
      active: true,
    },
    {
      label: "Processing",
      date: order.processedAt,
      icon: <Package className="h-5 w-5" />,
      color: "text-blue-500",
      bgColor: "bg-blue-500",
      active: !!order.processedAt || ["processing", "shipped", "completed"].includes(order.status),
    },
    {
      label: "Shipped",
      date: order.shippedAt,
      icon: <Truck className="h-5 w-5" />,
      color: "text-indigo-500",
      bgColor: "bg-indigo-500",
      active: !!order.shippedAt || ["shipped", "completed"].includes(order.status),
    },
    {
      label: "Delivered",
      date: order.deliveredAt,
      icon: <CheckCircle className="h-5 w-5" />,
      color: "text-green-500",
      bgColor: "bg-green-500",
      active: !!order.deliveredAt || order.status === "completed",
    },
  ];

  // Add cancelled event if applicable
  if (order.status === "cancelled") {
    timelineEvents.push({
      label: "Cancelled",
      date: order.cancelledAt,
      icon: <X className="h-5 w-5" />,
      color: "text-red-500",
      bgColor: "bg-red-500",
      active: true,
    });
  }

  // Add revision events if applicable
  if (order.status === "in_revision" || order.revisionRequestedAt) {
    timelineEvents.push({
      label: "Revision Requested",
      date: order.revisionRequestedAt,
      icon: <RefreshCw className="h-5 w-5" />,
      color: "text-orange-500",
      bgColor: "bg-orange-500",
      active: true,
    });
  }

  if (order.revisionCompletedAt) {
    timelineEvents.push({
      label: "Revision Completed",
      date: order.revisionCompletedAt,
      icon: <CheckCircle className="h-5 w-5" />,
      color: "text-green-500",
      bgColor: "bg-green-500",
      active: true,
    });
  }

  // Sort the events by date if they have one
  const sortedEvents = [...timelineEvents].sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  return (
    <div className="mt-6">
      <ol className="relative border-l border-gray-200 ml-3">
        {sortedEvents.map((event, index) => (
          <li key={index} className="mb-6 ml-6">
            <span
              className={`absolute flex items-center justify-center w-8 h-8 rounded-full -left-4 ring-4 ring-white ${
                event.active ? event.bgColor : "bg-gray-200"
              }`}
            >
              <span className={event.active ? "text-white" : "text-gray-400"}>
                {event.icon}
              </span>
            </span>
            <h3
              className={`flex items-center mb-1 text-lg font-semibold ${
                event.active ? event.color : "text-gray-400"
              }`}
            >
              {event.label}
            </h3>
            {event.date && (
              <time className="block mb-2 text-sm font-normal leading-none text-gray-500">
                {format(new Date(event.date), "PPP 'at' p")}
              </time>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
} 