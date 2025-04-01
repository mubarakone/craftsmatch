"use client";

import { Storefront } from "@/lib/storefront/types";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { truncateText } from "@/lib/utils";

interface StorefrontCardProps {
  storefront: Storefront;
  className?: string;
  imageSize?: "small" | "medium" | "large";
}

export function StorefrontCard({ 
  storefront, 
  className = "", 
  imageSize = "medium" 
}: StorefrontCardProps) {
  const imageHeight = {
    small: "h-32",
    medium: "h-48",
    large: "h-64",
  }[imageSize];

  return (
    <Link 
      href={`/stores/${storefront.slug}`}
      className={`block group rounded-lg border overflow-hidden hover:shadow-md transition-shadow ${className}`}
    >
      <div className={`relative ${imageHeight} bg-slate-100`}>
        {storefront.bannerUrl ? (
          <Image 
            src={storefront.bannerUrl} 
            alt={storefront.name}
            fill
            style={{ objectFit: "cover" }}
            className="transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-indigo-100 p-4">
            <div className="text-center">
              <div className="font-bold text-indigo-700 text-lg">{storefront.name}</div>
              <div className="text-indigo-500 text-sm">View Store</div>
            </div>
          </div>
        )}
        
        {storefront.logoUrl && (
          <div className="absolute bottom-3 left-3 h-12 w-12 rounded-full overflow-hidden border-2 border-white bg-white">
            <Image 
              src={storefront.logoUrl} 
              alt={`${storefront.name} logo`}
              fill
              style={{ objectFit: "cover" }}
            />
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between">
          <h3 className="font-bold">{storefront.name}</h3>
        </div>
        
        {storefront.location && (
          <div className="flex items-center mt-2 text-sm text-slate-500">
            <MapPin className="h-3 w-3 mr-1" />
            <span>{storefront.location}</span>
          </div>
        )}
        
        <p className="mt-3 text-sm text-slate-600">
          {truncateText(storefront.description, 120)}
        </p>
      </div>
    </Link>
  );
} 