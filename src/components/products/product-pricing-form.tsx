"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productPricingSchema, ProductPricingFormValues } from "@/lib/validators/product";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";

interface ProductPricingFormProps {
  onComplete: (data: ProductPricingFormValues) => void;
  initialData?: FormData;
}

const CURRENCIES = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "JPY", label: "JPY - Japanese Yen" },
  { value: "CAD", label: "CAD - Canadian Dollar" },
  { value: "AUD", label: "AUD - Australian Dollar" },
];

export default function ProductPricingForm({ onComplete, initialData }: ProductPricingFormProps) {
  const [pricePreview, setPricePreview] = useState<string>("0.00");
  const [discountPreview, setDiscountPreview] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState<number | null>(null);
  
  // Initialize form with React Hook Form
  const form = useForm<ProductPricingFormValues>({
    resolver: zodResolver(productPricingSchema),
    defaultValues: {
      price: initialData?.get("price") ? Number(initialData.get("price")) : 0,
      discountPrice: initialData?.get("discountPrice") ? Number(initialData.get("discountPrice")) : undefined,
      currency: initialData?.get("currency") as string || "USD",
      sku: initialData?.get("sku") as string || "",
      quantity: initialData?.get("quantity") ? Number(initialData.get("quantity")) : 0,
      lowStockThreshold: initialData?.get("lowStockThreshold") ? Number(initialData.get("lowStockThreshold")) : 5,
    },
  });
  
  // Handle the price and discount calculations
  useEffect(() => {
    const price = form.watch("price");
    const discountPrice = form.watch("discountPrice");
    const currency = form.watch("currency");
    
    // Format the displayed price
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    });
    
    setPricePreview(formatter.format(price || 0));
    
    if (discountPrice && price > 0 && discountPrice < price) {
      setDiscountPreview(formatter.format(discountPrice));
      setDiscountPercent(Math.round(((price - discountPrice) / price) * 100));
    } else {
      setDiscountPreview(null);
      setDiscountPercent(null);
    }
  }, [form.watch("price"), form.watch("discountPrice"), form.watch("currency")]);
  
  // Handle form submission
  const onSubmit = (data: ProductPricingFormValues) => {
    onComplete(data);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      placeholder="0.00"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="discountPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discount Price (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      placeholder="0.00"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormDescription>
                    Leave empty if no discount applies
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CURRENCIES.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Price Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Regular Price:</span>
                  <span className="font-medium">{pricePreview}</span>
                </div>
                
                {discountPreview && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Discount Price:</span>
                      <span className="font-medium text-green-600">{discountPreview}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Savings:</span>
                      <span className="font-medium text-green-600">{discountPercent}% off</span>
                    </div>
                  </>
                )}
                
                <div className="border-t pt-4 mt-4">
                  <p className="text-sm text-muted-foreground">
                    Setting a competitive price can help attract more buyers. Consider your material costs, labor, and market rates when pricing.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Stock Keeping Unit" {...field} />
                </FormControl>
                <FormDescription>
                  Your product reference code
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity in Stock</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    step="1" 
                    placeholder="0"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="lowStockThreshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Low Stock Threshold</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1" 
                    step="1" 
                    placeholder="5"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 5)}
                  />
                </FormControl>
                <FormDescription>
                  Notify when stock falls below
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end">
          <Button type="submit">
            Continue to Shipping
          </Button>
        </div>
      </form>
    </Form>
  );
} 