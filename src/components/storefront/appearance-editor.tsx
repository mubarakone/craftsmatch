"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { updateStorefrontAppearance } from "@/lib/storefront/actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

const appearanceFormSchema = z.object({
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: "Please enter a valid hex color code.",
  }),
  secondaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: "Please enter a valid hex color code.",
  }),
  accentColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: "Please enter a valid hex color code.",
  }),
  fontFamily: z.string(),
  headerLayout: z.string(),
  productCardStyle: z.string(),
  customCss: z.string().optional(),
});

type AppearanceFormValues = z.infer<typeof appearanceFormSchema>;

interface AppearanceEditorProps {
  storefrontId: string;
  initialData?: Partial<AppearanceFormValues>;
}

export function AppearanceEditor({ storefrontId, initialData }: AppearanceEditorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("colors");
  const router = useRouter();

  const defaultValues: AppearanceFormValues = {
    primaryColor: "#4f46e5", // Indigo
    secondaryColor: "#f43f5e", // Rose
    accentColor: "#10b981", // Emerald
    fontFamily: "Inter",
    headerLayout: "standard",
    productCardStyle: "standard",
    customCss: "",
    ...(initialData || {}),
  };
  
  const form = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues,
  });

  async function onSubmit(values: AppearanceFormValues) {
    setIsSubmitting(true);
    try {
      await updateStorefrontAppearance(storefrontId, values);
      router.push(`/storefront/preview?id=${storefrontId}`);
    } catch (error) {
      console.error("Error updating storefront appearance:", error);
      // Display error to user
    } finally {
      setIsSubmitting(false);
    }
  }

  // Preview component that updates as form values change
  const PreviewComponent = () => {
    const formValues = form.watch();
    
    const previewStyle = {
      "--primary-color": formValues.primaryColor,
      "--secondary-color": formValues.secondaryColor,
      "--accent-color": formValues.accentColor,
      "--font-family": formValues.fontFamily,
    } as React.CSSProperties;

    return (
      <div className="border rounded-md p-4 bg-white" style={previewStyle}>
        <div className="mb-4 text-center">
          <div className="text-xl font-bold" style={{ color: "var(--primary-color)" }}>
            Storefront Preview
          </div>
          <div className="text-sm" style={{ color: "var(--secondary-color)" }}>
            See how your customizations look
          </div>
        </div>
        
        {/* Sample header */}
        <div 
          className="p-4 rounded-md mb-4 flex justify-between items-center" 
          style={{ backgroundColor: "var(--primary-color)" }}
        >
          <div className="text-white font-bold">Store Logo</div>
          <div className="flex gap-2">
            <div className="text-white text-sm">Home</div>
            <div className="text-white text-sm">Products</div>
            <div className="text-white text-sm">About</div>
          </div>
        </div>
        
        {/* Sample product cards */}
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i} 
              className="border rounded-md p-2"
              style={{ borderColor: "var(--secondary-color)" }}
            >
              <div className="bg-gray-200 h-24 rounded-md mb-2"></div>
              <div className="font-medium" style={{ color: "var(--primary-color)" }}>
                Product {i}
              </div>
              <div className="text-sm text-gray-600">$99.99</div>
              <button 
                className="mt-2 text-xs px-2 py-1 rounded-md text-white w-full"
                style={{ backgroundColor: "var(--accent-color)" }}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Customize Your Storefront</h1>
        <p className="text-muted-foreground mt-2">
          Personalize the look and feel of your storefront to match your brand.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        <div className="md:col-span-3">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="colors" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full">
                  <TabsTrigger value="colors" className="flex-1">Colors</TabsTrigger>
                  <TabsTrigger value="typography" className="flex-1">Typography</TabsTrigger>
                  <TabsTrigger value="layout" className="flex-1">Layout</TabsTrigger>
                  <TabsTrigger value="advanced" className="flex-1">Advanced</TabsTrigger>
                </TabsList>
                
                <TabsContent value="colors" className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="primaryColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Color</FormLabel>
                        <div className="flex space-x-2">
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <Input
                            type="color"
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="w-12 p-1 h-10"
                          />
                        </div>
                        <FormDescription>
                          The main color of your storefront.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="secondaryColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Secondary Color</FormLabel>
                        <div className="flex space-x-2">
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <Input
                            type="color"
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="w-12 p-1 h-10"
                          />
                        </div>
                        <FormDescription>
                          The complementary color for your storefront.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="accentColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Accent Color</FormLabel>
                        <div className="flex space-x-2">
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <Input
                            type="color"
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="w-12 p-1 h-10"
                          />
                        </div>
                        <FormDescription>
                          Color for buttons and important elements.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                
                <TabsContent value="typography" className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="fontFamily"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Font Family</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a font family" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Inter">Inter</SelectItem>
                            <SelectItem value="Roboto">Roboto</SelectItem>
                            <SelectItem value="Lato">Lato</SelectItem>
                            <SelectItem value="Montserrat">Montserrat</SelectItem>
                            <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The font family used throughout your storefront.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                
                <TabsContent value="layout" className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="headerLayout"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Header Layout</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a header layout" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="centered">Centered</SelectItem>
                            <SelectItem value="minimal">Minimal</SelectItem>
                            <SelectItem value="expanded">Expanded</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The layout style for your storefront header.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="productCardStyle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Card Style</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a product card style" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="compact">Compact</SelectItem>
                            <SelectItem value="detailed">Detailed</SelectItem>
                            <SelectItem value="minimal">Minimal</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The style for your product cards.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                
                <TabsContent value="advanced" className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="customCss"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom CSS</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="/* Add your custom CSS here */"
                            className="font-mono h-40"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Advanced: Add custom CSS to further personalize your storefront.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Back
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save and Preview"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
        
        <div className="md:col-span-2">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-4">Live Preview</h3>
              <PreviewComponent />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 