"use client";

import { useEffect, useState } from 'react';

/**
 * Hook to detect if the current device is a mobile device
 * @param breakpoint - Optional breakpoint width to consider as mobile (default: 768px)
 * @returns Boolean indicating if the device is mobile
 */
export function useMobileDetection(breakpoint: number = 768) {
  // Default to false for server-side rendering
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Function to check if the viewport width is less than the breakpoint
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };
    
    // Check on mount
    checkMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);
    
    // Clean up event listener
    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);
  
  return isMobile;
}

/**
 * Hook to detect touch capable devices
 * @returns Boolean indicating if the device has touch capabilities
 */
export function useTouchDetection() {
  const [isTouch, setIsTouch] = useState(false);
  
  useEffect(() => {
    // Use matchMedia to detect touch capability
    const mediaQuery = window.matchMedia('(hover: none) and (pointer: coarse)');
    setIsTouch(mediaQuery.matches);
    
    // Listen for changes
    const updateTouchCapability = (e: MediaQueryListEvent) => {
      setIsTouch(e.matches);
    };
    
    mediaQuery.addEventListener('change', updateTouchCapability);
    
    return () => mediaQuery.removeEventListener('change', updateTouchCapability);
  }, []);
  
  return isTouch;
} 