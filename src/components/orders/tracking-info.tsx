"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink, Package, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TrackingInfoProps {
  trackingNumber: string;
  carrier?: string;
  status?: string;
}

export function TrackingInfo({ trackingNumber, carrier, status }: TrackingInfoProps) {
  // Function to get carrier tracking URL
  const getTrackingUrl = () => {
    if (!carrier) return "#";

    switch (carrier.toLowerCase()) {
      case "ups":
        return `https://www.ups.com/track?tracknum=${trackingNumber}`;
      case "fedex":
        return `https://www.fedex.com/apps/fedextrack/?tracknumbers=${trackingNumber}`;
      case "usps":
        return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
      case "dhl":
        return `https://www.dhl.com/us-en/home/tracking/tracking-express.html?submit=1&tracking-id=${trackingNumber}`;
      default:
        return "#";
    }
  };

  // Get status info with icon and color
  const getStatusInfo = () => {
    if (!status) {
      return {
        icon: <Package className="h-5 w-5" />,
        label: "Unknown",
        color: "text-gray-500",
        bgColor: "bg-gray-100",
      };
    }

    switch (status.toLowerCase()) {
      case "in_transit":
        return {
          icon: <Truck className="h-5 w-5" />,
          label: "In Transit",
          color: "text-blue-500",
          bgColor: "bg-blue-100",
        };
      case "delivered":
        return {
          icon: <Package className="h-5 w-5" />,
          label: "Delivered",
          color: "text-green-500",
          bgColor: "bg-green-100",
        };
      case "pending":
        return {
          icon: <Package className="h-5 w-5" />,
          label: "Pending",
          color: "text-yellow-500",
          bgColor: "bg-yellow-100",
        };
      default:
        return {
          icon: <Package className="h-5 w-5" />,
          label: status.charAt(0).toUpperCase() + status.slice(1).replace("_", " "),
          color: "text-gray-500",
          bgColor: "bg-gray-100",
        };
    }
  };

  const { icon, label, color, bgColor } = getStatusInfo();
  const trackingUrl = getTrackingUrl();

  return (
    <div className="border rounded-md p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`${bgColor} p-2 rounded-full`}>
            <span className={color}>{icon}</span>
          </div>
          <div>
            <h3 className="font-medium">Tracking Number</h3>
            <p className="text-sm text-muted-foreground">{trackingNumber}</p>
            {carrier && (
              <p className="text-sm text-muted-foreground">
                Carrier: {carrier.toUpperCase()}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col md:items-end gap-2">
          {status && (
            <div className={`px-3 py-1 rounded-full text-sm ${bgColor} ${color}`}>
              {label}
            </div>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link href={trackingUrl} target="_blank" rel="noopener noreferrer">
              Track Package
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 