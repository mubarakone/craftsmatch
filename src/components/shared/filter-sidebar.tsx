"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface FilterGroup {
  id: string;
  name: string;
  type: "checkbox" | "radio" | "range";
  options?: {
    id: string;
    label: string;
    count?: number;
  }[];
  range?: {
    min: number;
    max: number;
    step: number;
    unit: string;
  };
}

interface FilterSidebarProps {
  filters: FilterGroup[];
  className?: string;
}

export function FilterSidebar({ filters, className }: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(filters.map((filter) => [filter.id, true]))
  );

  // Get current filter values from URL
  const getFilterValues = (filterId: string): string[] => {
    return searchParams.getAll(filterId);
  };

  // Get range values as array [min, max]
  const getRangeValues = (filterId: string): [number, number] => {
    const rangeFilter = filters.find((f) => f.id === filterId && f.type === "range");
    if (!rangeFilter?.range) return [0, 100];
    
    const minParam = searchParams.get(`${filterId}_min`);
    const maxParam = searchParams.get(`${filterId}_max`);
    
    const min = minParam ? parseFloat(minParam) : rangeFilter.range.min;
    const max = maxParam ? parseFloat(maxParam) : rangeFilter.range.max;
    
    return [min, max];
  };

  // Toggle filter expansion
  const toggleExpand = (filterId: string) => {
    setExpanded((prev) => ({
      ...prev,
      [filterId]: !prev[filterId],
    }));
  };

  // Apply filter when checkbox/radio changes
  const handleFilterChange = (filterId: string, optionId: string, checked: boolean) => {
    const newParams = new URLSearchParams(searchParams.toString());
    
    if (filters.find((f) => f.id === filterId)?.type === "radio") {
      // For radio buttons, remove old value and add new one if checked
      newParams.delete(filterId);
      if (checked) {
        newParams.append(filterId, optionId);
      }
    } else {
      // For checkboxes, add or remove the specific value
      const values = getFilterValues(filterId);
      
      if (checked && !values.includes(optionId)) {
        newParams.append(filterId, optionId);
      } else if (!checked) {
        // Remove this specific value
        newParams.delete(filterId);
        values.filter(v => v !== optionId).forEach(v => {
          newParams.append(filterId, v);
        });
      }
    }
    
    router.push(`${pathname}?${newParams.toString()}`);
  };

  // Apply range filter
  const handleRangeChange = (filterId: string, values: number[]) => {
    const newParams = new URLSearchParams(searchParams.toString());
    const rangeFilter = filters.find((f) => f.id === filterId && f.type === "range");
    
    if (!rangeFilter?.range) return;
    
    // Only set params if the values differ from defaults
    if (values[0] === rangeFilter.range.min) {
      newParams.delete(`${filterId}_min`);
    } else {
      newParams.set(`${filterId}_min`, values[0].toString());
    }
    
    if (values[1] === rangeFilter.range.max) {
      newParams.delete(`${filterId}_max`);
    } else {
      newParams.set(`${filterId}_max`, values[1].toString());
    }
    
    router.push(`${pathname}?${newParams.toString()}`);
  };

  // Clear all filters
  const clearAllFilters = () => {
    router.push(pathname);
  };

  return (
    <div className={cn("w-full space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filters</h2>
        <Button
          variant="link"
          className="h-auto p-0 text-sm"
          onClick={clearAllFilters}
        >
          Clear all
        </Button>
      </div>

      <div className="space-y-2">
        {filters.map((filter) => (
          <div key={filter.id} className="border rounded-md">
            <button
              className="flex w-full items-center justify-between px-4 py-3"
              onClick={() => toggleExpand(filter.id)}
              aria-expanded={expanded[filter.id]}
            >
              <span className="font-medium">{filter.name}</span>
              {expanded[filter.id] ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>

            {expanded[filter.id] && (
              <div className="px-4 pb-4 pt-1">
                {filter.type === "range" && filter.range && (
                  <div className="space-y-5">
                    <Slider
                      defaultValue={getRangeValues(filter.id)}
                      min={filter.range.min}
                      max={filter.range.max}
                      step={filter.range.step}
                      onValueCommit={(values) => 
                        handleRangeChange(filter.id, values)
                      }
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {getRangeValues(filter.id)[0]} {filter.range.unit}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {getRangeValues(filter.id)[1]} {filter.range.unit}
                      </span>
                    </div>
                  </div>
                )}

                {(filter.type === "checkbox" || filter.type === "radio") &&
                  filter.options?.map((option) => {
                    const checked = getFilterValues(filter.id).includes(option.id);
                    return (
                      <div key={option.id} className="flex items-center py-1">
                        <input
                          type={filter.type}
                          id={`${filter.id}-${option.id}`}
                          name={filter.id}
                          value={option.id}
                          checked={checked}
                          onChange={(e) => 
                            handleFilterChange(filter.id, option.id, e.target.checked)
                          }
                          className="sr-only"
                        />
                        <label
                          htmlFor={`${filter.id}-${option.id}`}
                          className="flex w-full cursor-pointer items-center text-sm"
                        >
                          <span
                            className={cn(
                              "mr-2 flex h-4 w-4 items-center justify-center rounded border",
                              checked
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-input"
                            )}
                          >
                            {checked && <Check className="h-3 w-3" />}
                          </span>
                          {option.label}
                          {option.count !== undefined && (
                            <span className="ml-auto text-xs text-muted-foreground">
                              ({option.count})
                            </span>
                          )}
                        </label>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 