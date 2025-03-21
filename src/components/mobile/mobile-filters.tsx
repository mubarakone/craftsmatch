"use client";

import { useState, useEffect } from "react";
import { X, Filter, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMobileDetection } from "@/lib/hooks/use-mobile-detection";

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

export interface FilterGroup {
  id: string;
  name: string;
  type: "checkbox" | "radio" | "range";
  options?: FilterOption[];
  range?: {
    min: number;
    max: number;
    step: number;
    unit: string;
  };
}

interface MobileFiltersProps {
  filterGroups: FilterGroup[];
  selectedFilters: Record<string, any>;
  onChange: (filters: Record<string, any>) => void;
}

export function MobileFilters({
  filterGroups,
  selectedFilters,
  onChange,
}: MobileFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<Record<string, any>>(selectedFilters);
  const isMobile = useMobileDetection();

  // Sync with parent filters when they change
  useEffect(() => {
    setLocalFilters(selectedFilters);
  }, [selectedFilters]);

  // Close on desktop
  useEffect(() => {
    if (!isMobile) setIsOpen(false);
  }, [isMobile]);

  // Prevent scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const toggleFilter = () => setIsOpen(!isOpen);

  const applyFilters = () => {
    onChange(localFilters);
    setIsOpen(false);
  };

  const resetFilters = () => {
    const emptyFilters = filterGroups.reduce((acc, group) => {
      if (group.type === "checkbox") {
        acc[group.id] = [];
      } else if (group.type === "radio") {
        acc[group.id] = "";
      } else if (group.type === "range") {
        acc[group.id] = [
          group.range?.min || 0,
          group.range?.max || 100,
        ];
      }
      return acc;
    }, {} as Record<string, any>);
    
    setLocalFilters(emptyFilters);
  };

  const activeFilterCount = Object.entries(selectedFilters).reduce((count, [key, value]) => {
    if (Array.isArray(value) && value.length > 0) {
      return count + value.length;
    }
    if (value !== "" && value !== null && value !== undefined) {
      return count + 1;
    }
    return count;
  }, 0);

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={toggleFilter} 
        className="flex items-center gap-2 lg:hidden"
      >
        <Filter className="h-4 w-4" />
        Filters
        {activeFilterCount > 0 && (
          <span className="ml-1 h-5 w-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          <div className="mobile-nav-overlay" onClick={toggleFilter} />
          <div className="mobile-filter-container">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Filters</h2>
              <Button variant="ghost" size="icon" onClick={toggleFilter}>
                <X className="h-6 w-6" />
                <span className="sr-only">Close filters</span>
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[calc(75vh-60px)] p-4">
              <div className="space-y-6">
                <p>Filter components will be implemented when UI components are available.</p>
              </div>
            </div>

            <div className="p-4 border-t flex items-center justify-between gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="flex-1"
              >
                Reset All
              </Button>
              <Button
                size="sm"
                onClick={applyFilters}
                className="flex-1"
              >
                <Check className="h-4 w-4 mr-1" />
                Apply Filters
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
} 