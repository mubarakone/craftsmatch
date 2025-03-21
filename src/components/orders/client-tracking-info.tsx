"use client";

import dynamic from "next/dynamic";

// Dynamic import with loading component
const TrackingInfo = dynamic(() => import("./tracking-info").then(mod => mod.TrackingInfo), {
  loading: () => <div className="p-4 border rounded">Loading tracking information...</div>
});

export interface ClientTrackingInfoProps {
  trackingNumber: string;
  carrier?: string;
  status?: string;
}

export function ClientTrackingInfo({ trackingNumber, carrier, status }: ClientTrackingInfoProps) {
  return (
    <TrackingInfo 
      trackingNumber={trackingNumber}
      carrier={carrier}
      status={status}
    />
  );
} 