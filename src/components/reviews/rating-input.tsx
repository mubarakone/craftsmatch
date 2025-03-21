"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";

interface RatingInputProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  name?: string;
}

export default function RatingInput({
  value,
  onChange,
  disabled = false,
  size = "md",
  name,
}: RatingInputProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const [innerValue, setInnerValue] = useState(value);
  
  // Update inner value when external value changes
  useEffect(() => {
    setInnerValue(value);
  }, [value]);
  
  const stars = [1, 2, 3, 4, 5];
  
  const handleStarClick = (rating: number) => {
    if (disabled) return;
    setInnerValue(rating);
    onChange(rating);
  };
  
  const handleStarHover = (rating: number) => {
    if (disabled) return;
    setHoverRating(rating);
  };
  
  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  // Size classes
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };
  
  const starClasses = sizeClasses[size];
  
  return (
    <div 
      className="flex items-center" 
      onMouseLeave={handleMouseLeave}
    >
      {/* Hidden input for form submission */}
      {name && (
        <input 
          type="hidden" 
          name={name} 
          value={innerValue} 
        />
      )}
      
      {stars.map((star) => {
        const isActive = (hoverRating || innerValue) >= star;
        
        return (
          <button
            key={star}
            type="button"
            className={`text-yellow-400 p-0.5 ${disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer hover:scale-110"} transition-all`}
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => handleStarHover(star)}
            disabled={disabled}
            aria-label={`Rate ${star} out of 5 stars`}
          >
            <Star 
              className={`${starClasses} ${isActive ? "fill-current" : "fill-none"}`} 
            />
          </button>
        );
      })}
    </div>
  );
} 