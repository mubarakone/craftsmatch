"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  subcategories?: Category[];
}

interface FilterSidebarProps {
  categories: Category[];
}

export function FilterSidebar({ categories }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams?.get("category") || null
  );

  const handleCategoryClick = (categorySlug: string) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    
    if (categorySlug === selectedCategory) {
      // Unselect if already selected
      params.delete("category");
      setSelectedCategory(null);
    } else {
      params.set("category", categorySlug);
      setSelectedCategory(categorySlug);
    }
    
    params.set("page", "1"); // Reset to page 1
    router.push(`/marketplace?${params.toString()}`);
  };

  const handlePriceChange = (value: number[]) => {
    setPriceRange([value[0], value[1]]);
  };

  const applyPriceFilter = () => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("priceMin", priceRange[0].toString());
    params.set("priceMax", priceRange[1].toString());
    params.set("page", "1"); // Reset to page 1
    router.push(`/marketplace?${params.toString()}`);
  };

  const resetFilters = () => {
    setSelectedCategory(null);
    setPriceRange([0, 1000]);
    router.push("/marketplace");
  };

  const renderCategoryItem = (category: Category) => (
    <div key={category.id} className="mb-1">
      <button
        onClick={() => handleCategoryClick(category.slug)}
        className={`text-sm w-full text-left px-2 py-1 rounded hover:bg-gray-100 ${
          selectedCategory === category.slug ? "bg-blue-50 text-blue-600 font-medium" : ""
        }`}
      >
        {category.name}
      </button>
      
      {category.subcategories && category.subcategories.length > 0 && (
        <div className="ml-4 mt-1 space-y-1">
          {category.subcategories.map(renderCategoryItem)}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-3">Filters</h3>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={resetFilters} 
          className="text-xs text-gray-500 hover:text-gray-800"
        >
          Reset all filters
        </Button>
      </div>
      
      <Accordion type="single" collapsible defaultValue="categories">
        <AccordionItem value="categories">
          <AccordionTrigger className="py-2">Categories</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-1 pt-2">
              {categories.map(renderCategoryItem)}
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="price">
          <AccordionTrigger className="py-2">Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="px-2 pt-4 pb-2">
              <Slider
                defaultValue={[0, 1000]}
                max={1000}
                step={10}
                value={[priceRange[0], priceRange[1]]}
                onValueChange={handlePriceChange}
                className="mb-6"
              />
              <div className="flex justify-between mb-4 text-sm">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
              <Button 
                size="sm" 
                onClick={applyPriceFilter}
                className="w-full text-xs"
              >
                Apply Price Filter
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="materials">
          <AccordionTrigger className="py-2">Materials</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-2">
              {["Wood", "Metal", "Glass", "Ceramic", "Textile"].map((material) => (
                <div key={material} className="flex items-center space-x-2">
                  <Checkbox id={`material-${material}`} />
                  <label 
                    htmlFor={`material-${material}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {material}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="availability">
          <AccordionTrigger className="py-2">Availability</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="in-stock" />
                <label
                  htmlFor="in-stock"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  In Stock
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="customizable" />
                <label
                  htmlFor="customizable"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Customizable
                </label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
} 