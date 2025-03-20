"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface ImageGalleryProps {
  images: {
    src: string;
    alt: string;
  }[];
  className?: string;
}

export function ImageGallery({ images, className }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  if (!images.length) {
    return (
      <div className="aspect-square w-full bg-muted flex items-center justify-center">
        <p className="text-muted-foreground">No images available</p>
      </div>
    );
  }

  const nextImage = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
        <div
          className={cn(
            "relative h-full w-full transition-transform duration-300",
            isZoomed && "cursor-zoom-out"
          )}
          onClick={toggleZoom}
        >
          <Image
            src={images[activeIndex].src}
            alt={images[activeIndex].alt}
            fill
            priority
            className={cn(
              "object-contain transition-transform duration-300",
              isZoomed ? "scale-150" : "scale-100"
            )}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        {!isZoomed && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleZoom();
              }}
              className="absolute bottom-2 right-2 rounded-full bg-background/80 p-2 backdrop-blur-sm transition-colors hover:bg-background"
              aria-label="Zoom image"
            >
              <ZoomIn className="h-4 w-4" />
            </button>

            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 backdrop-blur-sm transition-colors hover:bg-background"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 backdrop-blur-sm transition-colors hover:bg-background"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex space-x-2 overflow-auto pb-1">
          {images.map((image, i) => (
            <button
              key={i}
              className={cn(
                "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2",
                activeIndex === i
                  ? "border-primary"
                  : "border-transparent opacity-70 hover:opacity-100"
              )}
              onClick={() => setActiveIndex(i)}
            >
              <Image
                src={image.src}
                alt={`Thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 