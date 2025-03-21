"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMobileDetection } from "@/lib/hooks/use-mobile-detection";

interface MobileGalleryProps {
  images: {
    id: string;
    url: string;
    alt: string;
  }[];
  aspectRatio?: "portrait" | "square";
  initialImage?: number;
}

export function MobileGallery({
  images,
  aspectRatio = "square",
  initialImage = 0,
}: MobileGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialImage);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const isMobile = useMobileDetection();
  
  // Reset index when images change
  useEffect(() => {
    setCurrentIndex(initialImage);
  }, [images, initialImage]);

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe && currentIndex < images.length - 1) {
      setCurrentIndex(prevIndex => prevIndex + 1);
    }
    
    if (isRightSwipe && currentIndex > 0) {
      setCurrentIndex(prevIndex => prevIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(prevIndex => prevIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prevIndex => prevIndex - 1);
    }
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  // Determine aspect ratio class
  const aspectRatioClass = aspectRatio === "portrait" 
    ? "aspect-[3/4]" 
    : "aspect-square";

  if (!images || images.length === 0) {
    return (
      <div 
        className={`mobile-gallery-view bg-slate-100 rounded-md flex items-center justify-center ${aspectRatioClass}`}
      >
        <p className="text-slate-500">No images available</p>
      </div>
    );
  }

  return (
    <div className="mobile-gallery-view">
      <div
        ref={galleryRef}
        className={`relative overflow-hidden rounded-md ${aspectRatioClass}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="transition-transform duration-300 ease-in-out h-full w-full"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          <div className="absolute inset-0 flex">
            {images.map((image, index) => (
              <div 
                key={image.id} 
                className="relative min-w-full h-full flex-shrink-0"
                style={{ left: `${index * 100}%` }}
              >
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority={index === 0}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white/90 rounded-full h-8 w-8 shadow-sm"
              onClick={goToPrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Previous image</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white/90 rounded-full h-8 w-8 shadow-sm"
              onClick={goToNext}
              disabled={currentIndex === images.length - 1}
            >
              <ChevronRight className="h-5 w-5" />
              <span className="sr-only">Next image</span>
            </Button>
          </>
        )}

        {/* Current image indicator */}
        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Image indicator dots */}
      {images.length > 1 && (
        <div className="mobile-gallery-indicator">
          {images.map((_, index) => (
            <button
              key={index}
              className={`mobile-gallery-dot ${index === currentIndex ? "active" : ""}`}
              onClick={() => goToImage(index)}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Thumbnail preview for larger screens */}
      {!isMobile && images.length > 1 && (
        <div className="hidden sm:grid grid-cols-6 gap-2 mt-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all ${
                index === currentIndex ? "border-primary" : "border-transparent hover:border-gray-300"
              }`}
              onClick={() => goToImage(index)}
            >
              <Image
                src={image.url}
                alt={`Thumbnail ${index + 1}`}
                fill
                sizes="100px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 