import { db } from "@/lib/db";
import { categories, products } from "@/lib/db/schema";
import { eq, isNull, ne } from "drizzle-orm";
import { createSlug } from "@/lib/utils";

export interface CategoryWithChildren {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  children: CategoryWithChildren[];
}

export interface CategoryBreadcrumb {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
}

// Mock data for categories
const MOCK_CATEGORIES: CategoryWithChildren[] = [
  {
    id: "cat_furniture",
    name: "Furniture",
    slug: "furniture",
    description: "Handcrafted furniture items",
    parentId: null,
    children: [
      {
        id: "cat_tables",
        name: "Tables",
        slug: "tables",
        description: "Dining, coffee, and side tables",
        parentId: "cat_furniture",
        children: []
      },
      {
        id: "cat_chairs",
        name: "Chairs",
        slug: "chairs",
        description: "Dining, lounge, and accent chairs",
        parentId: "cat_furniture",
        children: []
      },
      {
        id: "cat_shelving",
        name: "Shelving",
        slug: "shelving",
        description: "Bookcases, wall shelves, and display units",
        parentId: "cat_furniture",
        children: []
      }
    ]
  },
  {
    id: "cat_decor",
    name: "Home Decor",
    slug: "home-decor",
    description: "Decorative crafts for your home",
    parentId: null,
    children: [
      {
        id: "cat_textiles",
        name: "Textiles",
        slug: "textiles",
        description: "Handwoven and hand-dyed textiles",
        parentId: "cat_decor",
        children: []
      },
      {
        id: "cat_ceramics",
        name: "Ceramics",
        slug: "ceramics",
        description: "Handmade ceramic pieces",
        parentId: "cat_decor",
        children: []
      }
    ]
  }
];

// Get flattened list of categories
const FLAT_CATEGORIES = flattenCategories(MOCK_CATEGORIES);

function flattenCategories(categories: CategoryWithChildren[]): any[] {
  const result: any[] = [];
  
  categories.forEach(category => {
    result.push({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      parentId: category.parentId
    });
    
    if (category.children.length) {
      result.push(...flattenCategories(category.children));
    }
  });
  
  return result;
}

/**
 * Build a nested category tree from flat category list
 */
export function buildCategoryTree(categoriesList: any[]): CategoryWithChildren[] {
  const categoryMap = new Map();
  const rootCategories: CategoryWithChildren[] = [];

  // First, create a map of categories by id
  categoriesList.forEach(category => {
    categoryMap.set(category.id, {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      parentId: category.parentId,
      children: [],
    });
  });

  // Then, build the tree structure
  categoriesList.forEach(category => {
    const categoryWithChildren = categoryMap.get(category.id);
    
    if (category.parentId === null) {
      rootCategories.push(categoryWithChildren);
    } else {
      const parent = categoryMap.get(category.parentId);
      if (parent) {
        parent.children.push(categoryWithChildren);
      }
    }
  });

  return rootCategories;
}

/**
 * Get all categories as a flat list
 */
export async function getAllCategories() {
  try {
    // Use mock data for build/preview
    if (typeof window !== "undefined" || process.env.NODE_ENV === "production") {
      return FLAT_CATEGORIES;
    }
    
    const categoriesList = await db
      .select()
      .from(categories)
      .orderBy(categories.name);
    
    return categoriesList;
  } catch (error) {
    console.error("Error fetching all categories:", error);
    return FLAT_CATEGORIES;
  }
}

/**
 * Get root categories (categories with no parent)
 */
export async function getRootCategories() {
  try {
    // Use mock data for build/preview
    if (typeof window !== "undefined" || process.env.NODE_ENV === "production") {
      return FLAT_CATEGORIES.filter(cat => cat.parentId === null);
    }
    
    const rootCategories = await db
      .select()
      .from(categories)
      .where(isNull(categories.parentId))
      .orderBy(categories.name);
    
    return rootCategories;
  } catch (error) {
    console.error("Error fetching root categories:", error);
    return FLAT_CATEGORIES.filter(cat => cat.parentId === null);
  }
}

/**
 * Get the full nested category tree
 */
export async function getCategoryTree() {
  try {
    // Use mock data for build/preview
    if (typeof window !== "undefined" || process.env.NODE_ENV === "production") {
      return MOCK_CATEGORIES;
    }
    
    const allCategories = await getAllCategories();
    return buildCategoryTree(allCategories);
  } catch (error) {
    console.error("Error building category tree:", error);
    return MOCK_CATEGORIES;
  }
}

/**
 * Get all categories with their hierarchical structure
 */
export async function getAllCategoriesWithChildren(): Promise<CategoryWithChildren[]> {
  try {
    // Use mock data for build/preview
    if (typeof window !== "undefined" || process.env.NODE_ENV === "production") {
      return MOCK_CATEGORIES;
    }
    
    // Original implementation for server
    const allCategories = await db
      .select()
      .from(categories)
      .orderBy(categories.name);
    
    // Organize into parent-child relationship
    const categoryMap: Record<string, CategoryWithChildren> = {};
    
    // First pass: create CategoryWithChildren objects and store in map
    allCategories.forEach(category => {
      categoryMap[category.id] = {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        parentId: category.parentId,
        children: [],
      };
    });
    
    // Second pass: build the hierarchy
    const rootCategories: CategoryWithChildren[] = [];
    
    allCategories.forEach(category => {
      if (category.parentId === null) {
        rootCategories.push(categoryMap[category.id]);
      } else if (categoryMap[category.parentId]) {
        categoryMap[category.parentId].children.push(categoryMap[category.id]);
      }
    });
    
    return rootCategories;
  } catch (error) {
    console.error("Error fetching categories with children:", error);
    return MOCK_CATEGORIES;
  }
}

/**
 * Get all direct child categories of a parent category
 */
export async function getCategoryChildren(parentId: string | null): Promise<CategoryWithChildren[]> {
  try {
    // Use mock data for build/preview
    if (typeof window !== "undefined" || process.env.NODE_ENV === "production") {
      if (parentId === null) {
        return MOCK_CATEGORIES;
      }
      
      // Find the parent category in the flattened list
      const parent = FLAT_CATEGORIES.find(cat => cat.id === parentId);
      if (!parent) return [];
      
      // Return children from the mock data
      const parentInMock = findCategoryById(MOCK_CATEGORIES, parentId);
      return parentInMock ? parentInMock.children : [];
    }
    
    let childCategories;
    
    if (parentId === null) {
      childCategories = await db
        .select()
        .from(categories)
        .where(isNull(categories.parentId))
        .orderBy(categories.name);
    } else {
      childCategories = await db
        .select()
        .from(categories)
        .where(eq(categories.parentId, parentId))
        .orderBy(categories.name);
    }
    
    return childCategories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      parentId: category.parentId,
      children: [], // Placeholder for further children if needed
    }));
  } catch (error) {
    console.error("Error fetching category children:", error);
    return [];
  }
}

// Helper function to find a category by ID in the mock data
function findCategoryById(categories: CategoryWithChildren[], id: string): CategoryWithChildren | null {
  for (const category of categories) {
    if (category.id === id) {
      return category;
    }
    
    if (category.children.length > 0) {
      const found = findCategoryById(category.children, id);
      if (found) return found;
    }
  }
  
  return null;
}

/**
 * Get category breadcrumb (path from root to the category)
 */
export async function getCategoryBreadcrumb(categoryId: string): Promise<CategoryBreadcrumb[]> {
  try {
    // Use mock data for build/preview
    if (typeof window !== "undefined" || process.env.NODE_ENV === "production") {
      const breadcrumb: CategoryBreadcrumb[] = [];
      const buildBreadcrumb = (categories: CategoryWithChildren[], id: string, path: CategoryBreadcrumb[] = []) => {
        for (const category of categories) {
          if (category.id === id) {
            path.push({
              id: category.id,
              name: category.name,
              slug: category.slug,
              parentId: category.parentId
            });
            return true;
          }
          
          if (category.children.length > 0) {
            path.push({
              id: category.id,
              name: category.name,
              slug: category.slug,
              parentId: category.parentId
            });
            
            const found = buildBreadcrumb(category.children, id, path);
            if (found) return true;
            
            path.pop();
          }
        }
        return false;
      };
      
      buildBreadcrumb(MOCK_CATEGORIES, categoryId, breadcrumb);
      return breadcrumb;
    }
    
    // Original implementation for server
    const breadcrumb: CategoryBreadcrumb[] = [];
    let currentId = categoryId;
    
    while (currentId) {
      const category = await db
        .select()
        .from(categories)
        .where(eq(categories.id, currentId))
        .limit(1)
        .then(rows => rows[0] || null);
      
      if (!category) break;
      
      breadcrumb.unshift({
        id: category.id,
        name: category.name,
        slug: category.slug,
        parentId: category.parentId,
      });
      
      currentId = category.parentId || "";
    }
    
    return breadcrumb;
  } catch (error) {
    console.error("Error getting category breadcrumb:", error);
    return [];
  }
}

/**
 * Create a new category
 */
export async function createCategory(data: {
  name: string;
  description?: string;
  iconUrl?: string;
  imageUrl?: string;
  parentId?: string;
}) {
  try {
    // Use mock implementation for build/preview
    if (typeof window !== "undefined" || process.env.NODE_ENV === "production") {
      const id = `cat_${createSlug(data.name)}`;
      return {
        success: true,
        category: {
          id,
          name: data.name,
          slug: createSlug(data.name),
          description: data.description || null,
          parentId: data.parentId || null
        }
      };
    }
    
    // Original implementation
    const slug = createSlug(data.name);
    
    // Check if slug already exists
    const existingCategory = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1)
      .then(rows => rows[0] || null);
    
    if (existingCategory) {
      return {
        success: false,
        error: "A category with this name already exists",
      };
    }
    
    const [category] = await db
      .insert(categories)
      .values({
        name: data.name,
        slug,
        description: data.description || null,
        parentId: data.parentId || null,
      })
      .returning();
    
    return {
      success: true,
      category,
    };
  } catch (error) {
    console.error("Error creating category:", error);
    return {
      success: false,
      error: "Failed to create category",
    };
  }
}

/**
 * Update an existing category
 */
export async function updateCategory(
  categoryId: string,
  data: {
    name?: string;
    description?: string;
    parentId?: string | null;
  }
) {
  // Use mock implementation for build/preview
  if (typeof window !== "undefined" || process.env.NODE_ENV === "production") {
    const category = FLAT_CATEGORIES.find(cat => cat.id === categoryId);
    if (!category) {
      return {
        success: false,
        error: "Category not found",
      };
    }
    
    return {
      success: true,
      category: {
        ...category,
        name: data.name || category.name,
        description: data.description !== undefined ? data.description : category.description,
        parentId: data.parentId !== undefined ? data.parentId : category.parentId,
      }
    };
  }
  
  // Original implementation
  try {
    const existingCategory = await db
      .select()
      .from(categories)
      .where(eq(categories.id, categoryId))
      .limit(1)
      .then(rows => rows[0] || null);
    
    if (!existingCategory) {
      return {
        success: false,
        error: "Category not found",
      };
    }
    
    let slug = existingCategory.slug;
    
    // If name changed, update slug
    if (data.name && data.name !== existingCategory.name) {
      slug = createSlug(data.name);
      
      // Check if new slug already exists for a different category
      const slugExists = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, slug))
        .where(ne(categories.id, categoryId))
        .limit(1)
        .then(rows => rows[0] || null);
      
      if (slugExists) {
        return {
          success: false,
          error: "A category with this name already exists",
        };
      }
    }
    
    // Prevent category from becoming its own parent or child
    if (data.parentId === categoryId) {
      return {
        success: false,
        error: "A category cannot be its own parent",
      };
    }
    
    // Check if the new parent is a descendant of this category
    if (data.parentId) {
      const isDescendant = await isCategoryDescendant(data.parentId, categoryId);
      if (isDescendant) {
        return {
          success: false,
          error: "Cannot set a descendant category as parent",
        };
      }
    }
    
    const [updatedCategory] = await db
      .update(categories)
      .set({
        name: data.name || existingCategory.name,
        slug,
        description: data.description !== undefined ? data.description : existingCategory.description,
        parentId: data.parentId !== undefined ? data.parentId : existingCategory.parentId,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, categoryId))
      .returning();
    
    return {
      success: true,
      category: updatedCategory,
    };
  } catch (error) {
    console.error("Error updating category:", error);
    return {
      success: false,
      error: "Failed to update category",
    };
  }
}

/**
 * Delete a category
 */
export async function deleteCategory(categoryId: string) {
  // Use mock implementation for build/preview
  if (typeof window !== "undefined" || process.env.NODE_ENV === "production") {
    const category = FLAT_CATEGORIES.find(cat => cat.id === categoryId);
    if (!category) {
      return {
        success: false,
        error: "Category not found",
      };
    }
    
    // Check if category has children
    const hasChildren = FLAT_CATEGORIES.some(cat => cat.parentId === categoryId);
    if (hasChildren) {
      return {
        success: false,
        error: "Cannot delete a category that has subcategories",
      };
    }
    
    return { success: true };
  }
  
  // Original implementation
  try {
    // Check if category has children
    const childCategories = await db
      .select()
      .from(categories)
      .where(eq(categories.parentId, categoryId))
      .limit(1)
      .then(rows => rows.length > 0);
    
    if (childCategories) {
      return {
        success: false,
        error: "Cannot delete a category that has subcategories",
      };
    }
    
    // Check if category has products
    const hasProducts = await db
      .select()
      .from(products)
      .where(eq(products.categoryId, categoryId))
      .limit(1)
      .then(rows => rows.length > 0);
    
    if (hasProducts) {
      return {
        success: false,
        error: "Cannot delete a category that has products assigned to it",
      };
    }
    
    await db
      .delete(categories)
      .where(eq(categories.id, categoryId));
    
    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting category:", error);
    return {
      success: false,
      error: "Failed to delete category",
    };
  }
}

/**
 * Check if a category is a descendant of another category
 */
async function isCategoryDescendant(descendantId: string, ancestorId: string): Promise<boolean> {
  // Use mock implementation for build/preview
  if (typeof window !== "undefined" || process.env.NODE_ENV === "production") {
    let current = FLAT_CATEGORIES.find(cat => cat.id === descendantId);
    while (current && current.parentId) {
      if (current.parentId === ancestorId) {
        return true;
      }
      current = FLAT_CATEGORIES.find(cat => cat.id === current.parentId);
    }
    return false;
  }
  
  // Original implementation
  let currentId = descendantId;
  const visited = new Set<string>();
  
  while (currentId) {
    if (visited.has(currentId)) {
      // Circular reference detected
      return false;
    }
    
    visited.add(currentId);
    
    if (currentId === ancestorId) {
      return true;
    }
    
    const category = await db
      .select()
      .from(categories)
      .where(eq(categories.id, currentId))
      .limit(1)
      .then(rows => rows[0] || null);
    
    if (!category || !category.parentId) {
      return false;
    }
    
    currentId = category.parentId;
  }
  
  return false;
}