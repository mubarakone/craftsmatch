import React from "react";
import { CheckCircle, Clock, Package, RefreshCw, ShieldAlert, Truck } from "lucide-react";

interface OrderStatusProps {
  status: string;
}

export function OrderStatus({ status }: OrderStatusProps) {
  const getStatusInfo = () => {
    switch (status) {
      case "pending":
        return {
          icon: <Clock className="h-8 w-8 text-yellow-500" />,
          label: "Pending",
          description: "Your order has been received and is awaiting processing.",
          color: "bg-yellow-100",
        };
      case "processing":
        return {
          icon: <Package className="h-8 w-8 text-blue-500" />,
          label: "Processing",
          description: "Your order is being prepared by the craftsperson.",
          color: "bg-blue-100",
        };
      case "shipped":
        return {
          icon: <Truck className="h-8 w-8 text-indigo-500" />,
          label: "Shipped",
          description: "Your order is on its way to you.",
          color: "bg-indigo-100",
        };
      case "completed":
        return {
          icon: <CheckCircle className="h-8 w-8 text-green-500" />,
          label: "Completed",
          description: "Your order has been delivered successfully.",
          color: "bg-green-100",
        };
      case "cancelled":
        return {
          icon: <ShieldAlert className="h-8 w-8 text-red-500" />,
          label: "Cancelled",
          description: "This order has been cancelled.",
          color: "bg-red-100",
        };
      case "in_revision":
        return {
          icon: <RefreshCw className="h-8 w-8 text-orange-500" />,
          label: "In Revision",
          description: "The craftsperson is working on your requested revisions.",
          color: "bg-orange-100",
        };
      default:
        return {
          icon: <Clock className="h-8 w-8 text-gray-500" />,
          label: "Unknown",
          description: "Order status information is unavailable.",
          color: "bg-gray-100",
        };
    }
  };

  const { icon, label, description, color } = getStatusInfo();

  return (
    <div className={`${color} p-4 rounded-lg flex items-start gap-4`}>
      {icon}
      <div>
        <h3 className="text-lg font-medium">{label}</h3>
        <p className="text-sm mt-1">{description}</p>
      </div>
    </div>
  );
} 