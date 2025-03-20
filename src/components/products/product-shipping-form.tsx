"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

// Define shipping-related form schema
const shippingFormSchema = z.object({
  shippingType: z.enum(["flat", "calculated", "free", "manual"], {
    required_error: "Please select a shipping method",
  }),
  flatRate: z.number().optional(),
  processingTime: z.number().min(1, "Must be at least 1 day").default(3),
  isReturnable: z.boolean().default(false),
  returnPolicy: z.string().optional(),
  shippingNotes: z.string().optional(),
});

type ShippingFormValues = z.infer<typeof shippingFormSchema>;

interface ProductShippingFormProps {
  onComplete: (data: ShippingFormValues) => void;
  initialData?: FormData;
}

export default function ProductShippingForm({ onComplete, initialData }: ProductShippingFormProps) {
  // Initialize form with React Hook Form
  const form = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingFormSchema),
    defaultValues: {
      shippingType: (initialData?.get("shippingType") as any) || "flat",
      flatRate: initialData?.get("flatRate") ? Number(initialData.get("flatRate")) : 0,
      processingTime: initialData?.get("processingTime") ? Number(initialData.get("processingTime")) : 3,
      isReturnable: initialData?.get("isReturnable") === "true" || false,
      returnPolicy: initialData?.get("returnPolicy") as string || "",
      shippingNotes: initialData?.get("shippingNotes") as string || "",
    },
  });
  
  // Watch form values for conditional rendering
  const shippingType = form.watch("shippingType");
  const isReturnable = form.watch("isReturnable");
  
  // Handle form submission
  const onSubmit = (data: ShippingFormValues) => {
    onComplete(data);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="shippingType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Shipping Method</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <FormItem className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <RadioGroupItem value="flat" className="mt-1" />
                    </FormControl>
                    <div className="space-y-1">
                      <FormLabel className="font-medium">Flat Rate</FormLabel>
                      <FormDescription>
                        Charge a single shipping rate for all orders
                      </FormDescription>
                    </div>
                  </FormItem>
                  
                  <FormItem className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <RadioGroupItem value="calculated" className="mt-1" />
                    </FormControl>
                    <div className="space-y-1">
                      <FormLabel className="font-medium">Calculated</FormLabel>
                      <FormDescription>
                        Shipping cost calculated based on location and weight
                      </FormDescription>
                    </div>
                  </FormItem>
                  
                  <FormItem className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <RadioGroupItem value="free" className="mt-1" />
                    </FormControl>
                    <div className="space-y-1">
                      <FormLabel className="font-medium">Free Shipping</FormLabel>
                      <FormDescription>
                        Offer free shipping (cost absorbed by you)
                      </FormDescription>
                    </div>
                  </FormItem>
                  
                  <FormItem className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <RadioGroupItem value="manual" className="mt-1" />
                    </FormControl>
                    <div className="space-y-1">
                      <FormLabel className="font-medium">To be arranged</FormLabel>
                      <FormDescription>
                        Shipping details will be arranged after purchase
                      </FormDescription>
                    </div>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {shippingType === "flat" && (
          <FormField
            control={form.control}
            name="flatRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Flat Rate Amount</FormLabel>
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
                <FormDescription>
                  The fixed shipping cost for all orders
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <FormField
          control={form.control}
          name="processingTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Processing Time (days)</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(parseInt(value))} 
                defaultValue={field.value.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select processing time" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="2">2 days</SelectItem>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="5">5 days</SelectItem>
                  <SelectItem value="7">1 week</SelectItem>
                  <SelectItem value="14">2 weeks</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Time needed to prepare the order for shipping
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="isReturnable"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Accept Returns</FormLabel>
                <FormDescription>
                  Can buyers return this product?
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        {isReturnable && (
          <FormField
            control={form.control}
            name="returnPolicy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Return Policy</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe your return policy..." 
                    rows={3}
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Specify return window, condition requirements, and who pays for return shipping
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <FormField
          control={form.control}
          name="shippingNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Shipping Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Any additional information about shipping..." 
                  rows={3}
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Information like carrier preferences, packaging details, or delivery instructions
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end">
          <Button type="submit">
            Complete Product
          </Button>
        </div>
      </form>
    </Form>
  );
} 