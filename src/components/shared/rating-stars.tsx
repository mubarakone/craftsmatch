"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
  showValue?: boolean;
}

export function RatingStars({
  rating,
  maxRating = 5,
  interactive = false,
  onChange,
  size = "md",
  className,
  showValue = false,
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const [activeRating, setActiveRating] = useState(rating);

  const handleClick = (index: number) => {
    if (!interactive) return;
    
    const newRating = index + 1;
    setActiveRating(newRating);
    onChange?.(newRating);
  };

  const handleMouseEnter = (index: number) => {
    if (!interactive) return;
    setHoverRating(index + 1);
  };

  const handleMouseLeave = () => {
    if (!interactive) return;
    setHoverRating(0);
  };

  const displayRating = hoverRating || activeRating;

  // Size classes
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <div
      className={cn(
        "flex items-center",
        interactive && "cursor-pointer",
        className
      )}
    >
      <div className="flex">
        {Array.from({ length: maxRating }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              sizeClasses[size],
              "text-gray-300",
              i < displayRating && "text-amber-500 fill-amber-500"
            )}
            onClick={() => handleClick(i)}
            onMouseEnter={() => handleMouseEnter(i)}
            onMouseLeave={handleMouseLeave}
          />
        ))}
      </div>
      
      {showValue && (
        <span className={cn("ml-1", size === "sm" ? "text-xs" : "text-sm")}>
          {displayRating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

// Star icon component
function Star({
  className,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: React.SVGProps<SVGSVGElement> & {
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7L12 16.8 5.7 21l2.3-7-6-4.6h7.6z" />
    </svg>
  );
} 