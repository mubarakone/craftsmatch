"use client";

import { useState, useEffect } from "react";
import { getCategoryAttributes, AttributeWithOptions } from "@/lib/attributes/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AttributeFieldsProps {
  categoryId: string | null;
  onAttributesChange: (attributes: Array<{ attributeId: string; value: string }>) => void;
  initialValues?: Array<{ attributeId: string; value: string }>;
}

export default function AttributeFields({ 
  categoryId, 
  onAttributesChange,
  initialValues = [] 
}: AttributeFieldsProps) {
  const [attributes, setAttributes] = useState<AttributeWithOptions[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [attributeValues, setAttributeValues] = useState<Record<string, string>>({});
  
  // Fetch attributes when category changes
  useEffect(() => {
    if (!categoryId) {
      setAttributes([]);
      setAttributeValues({});
      return;
    }
    
    const fetchAttributes = async () => {
      try {
        setIsLoading(true);
        const attributesList = await getCategoryAttributes(categoryId);
        setAttributes(attributesList);
        
        // Initialize empty attribute values
        const initialAttributeValues: Record<string, string> = {};
        attributesList.forEach(attr => {
          // Check if we have initial values
          const initialValue = initialValues.find(v => v.attributeId === attr.id);
          initialAttributeValues[attr.id] = initialValue?.value || "";
        });
        
        setAttributeValues(initialAttributeValues);
      } catch (error) {
        console.error("Error fetching attributes:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAttributes();
  }, [categoryId, initialValues]);
  
  // Update parent component when attribute values change
  useEffect(() => {
    const attributes = Object.entries(attributeValues)
      .filter(([_, value]) => value !== "")
      .map(([attributeId, value]) => ({
        attributeId,
        value,
      }));
    
    onAttributesChange(attributes);
  }, [attributeValues, onAttributesChange]);
  
  // Handle attribute value change
  const handleAttributeChange = (attributeId: string, value: string) => {
    setAttributeValues(prev => ({
      ...prev,
      [attributeId]: value,
    }));
  };
  
  if (isLoading) {
    return <div>Loading attributes...</div>;
  }
  
  if (!categoryId || attributes.length === 0) {
    return null;
  }
  
  // Render appropriate field based on attribute type
  const renderAttributeField = (attribute: AttributeWithOptions) => {
    const value = attributeValues[attribute.id] || "";
    
    switch (attribute.type) {
      case "text":
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => handleAttributeChange(attribute.id, e.target.value)}
            placeholder={`Enter ${attribute.name}`}
          />
        );
        
      case "number":
        return (
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              value={value}
              onChange={(e) => handleAttributeChange(attribute.id, e.target.value)}
              placeholder={`Enter ${attribute.name}`}
            />
            {attribute.unit && (
              <span className="text-sm text-muted-foreground">{attribute.unit}</span>
            )}
          </div>
        );
        
      case "boolean":
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={value === "true"}
              onCheckedChange={(checked) => 
                handleAttributeChange(attribute.id, checked ? "true" : "false")
              }
            />
            <Label>{value === "true" ? "Yes" : "No"}</Label>
          </div>
        );
        
      case "select":
        return (
          <Select
            value={value}
            onValueChange={(value) => handleAttributeChange(attribute.id, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${attribute.name}`} />
            </SelectTrigger>
            <SelectContent>
              {attribute.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
        
      case "multiselect":
        // For multiselect, we store selected values as a JSON string
        const selectedValues = value ? JSON.parse(value) as string[] : [];
        
        return (
          <div className="space-y-2">
            {attribute.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${attribute.id}-${option}`}
                  checked={selectedValues.includes(option)}
                  onCheckedChange={(checked) => {
                    const newSelection = checked
                      ? [...selectedValues, option]
                      : selectedValues.filter((item) => item !== option);
                    
                    handleAttributeChange(attribute.id, JSON.stringify(newSelection));
                  }}
                />
                <Label htmlFor={`${attribute.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Attributes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {attributes.map((attribute) => (
            <div key={attribute.id} className="space-y-2">
              <Label className="flex items-center">
                {attribute.name}
                {attribute.isRequired && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </Label>
              {attribute.description && (
                <p className="text-sm text-muted-foreground mb-2">{attribute.description}</p>
              )}
              {renderAttributeField(attribute)}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 