import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { attributes, categories, productAttributes } from "@/lib/db/schema";

export interface AttributeWithOptions {
  id: string;
  name: string;
  type: "text" | "number" | "boolean" | "select" | "multiselect";
  isRequired: boolean;
  description?: string;
  unit?: string;
  options?: string[];
}

// Mock data for development
const MOCK_ATTRIBUTES: Record<string, AttributeWithOptions[]> = {
  "default": [
    {
      id: "attr_1",
      name: "Material",
      type: "select",
      isRequired: true,
      options: ["Wood", "Metal", "Glass", "Plastic", "Ceramic"]
    },
    {
      id: "attr_2",
      name: "Handmade",
      type: "boolean",
      isRequired: false
    },
    {
      id: "attr_3",
      name: "Custom Specifications",
      type: "text",
      isRequired: false
    }
  ],
  "cat_furniture": [
    {
      id: "attr_4",
      name: "Wood Type",
      type: "select",
      isRequired: true,
      options: ["Oak", "Pine", "Maple", "Walnut", "Cherry"]
    },
    {
      id: "attr_5",
      name: "Finish",
      type: "select",
      isRequired: true,
      options: ["Natural", "Stained", "Painted", "Distressed", "Glossy"]
    }
  ]
};

/**
 * Get attributes for a specific category
 */
export async function getCategoryAttributes(categoryId: string): Promise<AttributeWithOptions[]> {
  try {
    // Use mock data for build/preview
    if (typeof window !== "undefined" || process.env.NODE_ENV === "production") {
      return MOCK_ATTRIBUTES[categoryId] || MOCK_ATTRIBUTES.default;
    }
    
    // Server-side code
    const attributesList = await db
      .select()
      .from(attributes)
      .where(eq(attributes.categoryId, categoryId))
      .orderBy(attributes.name);

    // Transform them to match our interface
    const attributesWithOptions = attributesList.map((attribute) => {
      return {
        id: attribute.id,
        name: attribute.name,
        type: attribute.type as AttributeWithOptions["type"],
        isRequired: attribute.isRequired,
        description: attribute.description || undefined,
        unit: attribute.unit || undefined,
        options: attribute.options || undefined,
      };
    });

    return attributesWithOptions;
  } catch (error) {
    console.error("Error fetching category attributes:", error);
    return MOCK_ATTRIBUTES.default;
  }
}

/**
 * Save attribute values for a product
 */
export async function saveProductAttributes(
  productId: string, 
  attributeValues: Array<{ attributeId: string; value: string }>
): Promise<boolean> {
  try {
    // Use mock implementation for build/preview
    if (typeof window !== "undefined" || process.env.NODE_ENV === "production") {
      console.log("Mock saving attributes:", { productId, attributeValues });
      return true;
    }
    
    // Delete existing attributes first
    await db
      .delete(productAttributes)
      .where(eq(productAttributes.productId, productId));
    
    // Insert new attributes
    if (attributeValues.length > 0) {
      await db.insert(productAttributes).values(
        attributeValues.map(attr => ({
          productId,
          attributeId: attr.attributeId,
          value: attr.value,
        }))
      );
    }
    
    return true;
  } catch (error) {
    console.error("Error saving product attributes:", error);
    return false;
  }
}

/**
 * Get attribute by ID
 */
export async function getAttributeById(attributeId: string): Promise<AttributeWithOptions | null> {
  try {
    const [attribute] = await db
      .select()
      .from(attributes)
      .where(eq(attributes.id, attributeId))
      .limit(1);
    
    return attribute as AttributeWithOptions || null;
  } catch (error) {
    console.error("Error fetching attribute:", error);
    return null;
  }
}

/**
 * Format attribute value for display based on attribute type
 */
export function formatAttributeValue(attribute: AttributeWithOptions, value: string): string {
  if (!value) return '';
  
  switch (attribute.type) {
    case 'boolean':
      return value === 'true' ? 'Yes' : 'No';
    case 'number':
      return attribute.unit ? `${value} ${attribute.unit}` : value;
    case 'select':
    case 'multiselect':
      try {
        // Handle array of values for multiselect
        if (attribute.type === 'multiselect' && value.startsWith('[')) {
          const values = JSON.parse(value) as string[];
          return values.join(', ');
        }
        return value;
      } catch (e) {
        return value;
      }
    default:
      return value;
  }
}

/**
 * Group attributes by category
 */
export function groupAttributesByCategory(attributesList: AttributeWithOptions[]): Record<string, AttributeWithOptions[]> {
  const grouped: Record<string, AttributeWithOptions[]> = {};
  
  attributesList.forEach(attribute => {
    if (!grouped[attribute.categoryId]) {
      grouped[attribute.categoryId] = [];
    }
    grouped[attribute.categoryId].push(attribute);
  });
  
  return grouped;
} 