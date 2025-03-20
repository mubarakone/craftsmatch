"use client";

import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCategoryTree, CategoryWithChildren } from "@/lib/categories/utils";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface CategorySelectorProps {
  onCategorySelect: (categoryId: string) => void;
  selectedCategoryId?: string;
  includeRoot?: boolean;
}

export default function CategorySelector({ 
  onCategorySelect, 
  selectedCategoryId,
  includeRoot = false
}: CategorySelectorProps) {
  const [categories, setCategories] = useState<CategoryWithChildren[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedPath, setSelectedPath] = useState<CategoryWithChildren[]>([]);
  const [currentLevel, setCurrentLevel] = useState<CategoryWithChildren[]>([]);
  
  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const categoryTree = await getCategoryTree();
        setCategories(categoryTree);
        setCurrentLevel(categoryTree);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Find selected category path when selectedCategoryId changes
  useEffect(() => {
    if (!selectedCategoryId || categories.length === 0) return;
    
    const findCategoryPath = (
      categoryId: string,
      tree: CategoryWithChildren[],
      path: CategoryWithChildren[] = []
    ): CategoryWithChildren[] | null => {
      for (const category of tree) {
        if (category.id === categoryId) {
          return [...path, category];
        }
        
        if (category.children.length > 0) {
          const result = findCategoryPath(categoryId, category.children, [...path, category]);
          if (result) return result;
        }
      }
      
      return null;
    };
    
    const path = findCategoryPath(selectedCategoryId, categories);
    if (path) {
      setSelectedPath(path);
      // Set current level to the children of the parent of the selected category
      if (path.length > 1) {
        const parentCategory = path[path.length - 2];
        setCurrentLevel(parentCategory.children);
      } else {
        setCurrentLevel(categories);
      }
    }
  }, [selectedCategoryId, categories]);
  
  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    // Find the selected category
    const findCategory = (id: string, tree: CategoryWithChildren[]): CategoryWithChildren | null => {
      for (const category of tree) {
        if (category.id === id) {
          return category;
        }
        
        if (category.children.length > 0) {
          const result = findCategory(id, category.children);
          if (result) return result;
        }
      }
      
      return null;
    };
    
    const category = findCategory(categoryId, categories);
    if (!category) return;
    
    // If category has children, show them instead of selecting
    if (category.children.length > 0) {
      setCurrentLevel(category.children);
      setSelectedPath([...selectedPath, category]);
    } else {
      // If it's a leaf category, select it
      onCategorySelect(categoryId);
      setSelectedPath([...selectedPath, category]);
    }
  };
  
  // Navigate to parent category
  const navigateUp = (index: number) => {
    if (index < 0) {
      // Go to root
      setCurrentLevel(categories);
      setSelectedPath([]);
    } else {
      // Go to specific level
      const newPath = selectedPath.slice(0, index + 1);
      setSelectedPath(newPath);
      
      if (index === 0) {
        setCurrentLevel(categories);
      } else {
        const parentCategory = selectedPath[index - 1];
        setCurrentLevel(parentCategory.children);
      }
    }
  };
  
  if (isLoading) {
    return <div>Loading categories...</div>;
  }
  
  return (
    <div className="space-y-4">
      {/* Breadcrumb navigation */}
      <div className="flex items-center flex-wrap gap-2 text-sm mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigateUp(-1)}
          className={selectedPath.length === 0 ? "font-bold" : ""}
        >
          All Categories
        </Button>
        
        {selectedPath.map((category, index) => (
          <div key={category.id} className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigateUp(index)}
              className={index === selectedPath.length - 1 ? "font-bold" : ""}
            >
              {category.name}
            </Button>
          </div>
        ))}
      </div>
      
      {/* Category grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {includeRoot && selectedPath.length === 0 && (
          <CategoryButton 
            category={{ 
              id: "root", 
              name: "All Products", 
              slug: "all", 
              description: null, 
              parentId: null, 
              createdAt: new Date(), 
              updatedAt: new Date(), 
              children: [] 
            }} 
            onClick={() => onCategorySelect("root")} 
            isSelected={selectedCategoryId === "root"}
            hasChildren={false}
          />
        )}
        
        {currentLevel.map((category) => (
          <CategoryButton 
            key={category.id} 
            category={category} 
            onClick={() => handleCategorySelect(category.id)} 
            isSelected={category.id === selectedCategoryId}
            hasChildren={category.children.length > 0}
          />
        ))}
      </div>
    </div>
  );
}

interface CategoryButtonProps {
  category: CategoryWithChildren;
  onClick: () => void;
  isSelected: boolean;
  hasChildren: boolean;
}

function CategoryButton({ category, onClick, isSelected, hasChildren }: CategoryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-between p-3 border rounded-md transition-colors ${
        isSelected 
          ? "bg-primary text-primary-foreground border-primary" 
          : "bg-card hover:bg-accent"
      }`}
    >
      <span className="text-sm font-medium">{category.name}</span>
      {hasChildren && <ChevronRight className="h-4 w-4 ml-2 opacity-70" />}
    </button>
  );
} 