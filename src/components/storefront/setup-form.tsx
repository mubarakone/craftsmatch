"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { createStorefront } from "@/lib/storefront/actions";

const storefrontFormSchema = z.object({
  name: z.string().min(3, {
    message: "Storefront name must be at least 3 characters.",
  }),
  slug: z.string().min(3, {
    message: "Slug must be at least 3 characters.",
  }).regex(/^[a-z0-9-]+$/, {
    message: "Slug can only contain lowercase letters, numbers, and hyphens.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  location: z.string().optional(),
  contactEmail: z.string().email({
    message: "Please enter a valid email address.",
  }).optional(),
  contactPhone: z.string().optional(),
});

type StorefrontFormValues = z.infer<typeof storefrontFormSchema>;

export function StorefrontSetupForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  
  const form = useForm<StorefrontFormValues>({
    resolver: zodResolver(storefrontFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      location: "",
      contactEmail: "",
      contactPhone: "",
    },
  });

  async function onSubmit(values: StorefrontFormValues) {
    setIsSubmitting(true);
    try {
      const storefrontId = await createStorefront(values);
      router.push(`/storefront/customize?id=${storefrontId}`);
    } catch (error) {
      console.error("Error creating storefront:", error);
      // Display error to user
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Create Your Storefront</h1>
        <p className="text-muted-foreground mt-2">
          Set up your storefront to showcase your crafts and connect with potential customers.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Storefront Name</FormLabel>
                <FormControl>
                  <Input placeholder="My Amazing Crafts" {...field} />
                </FormControl>
                <FormDescription>
                  This is the name that will appear on your storefront.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Storefront URL</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <span className="mr-2 text-muted-foreground">craftsmatch.com/stores/</span>
                    <Input placeholder="my-amazing-crafts" {...field} />
                  </div>
                </FormControl>
                <FormDescription>
                  This will be the URL of your storefront. Use only lowercase letters, numbers, and hyphens.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell customers about your craft, what you create, and your story..."
                    className="resize-y min-h-32"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Describe your storefront to help customers understand what you offer.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="City, Country" {...field} />
                </FormControl>
                <FormDescription>
                  Let customers know where you're based.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="craftsman@example.com" {...field} />
                </FormControl>
                <FormDescription>
                  Public email for customer inquiries.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Phone</FormLabel>
                <FormControl>
                  <Input placeholder="+1 (555) 123-4567" {...field} />
                </FormControl>
                <FormDescription>
                  Optional phone number for customer inquiries.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Continue to Customization"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 