"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { createRevisionRequest } from "@/lib/orders/actions";

const revisionRequestSchema = z.object({
  description: z.string().min(10, {
    message: "Revision request must be at least 10 characters.",
  }),
});

type RevisionRequestFormData = z.infer<typeof revisionRequestSchema>;

interface RevisionRequestFormProps {
  orderId: string;
}

export function RevisionRequestForm({ orderId }: RevisionRequestFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<RevisionRequestFormData>({
    resolver: zodResolver(revisionRequestSchema),
    defaultValues: {
      description: "",
    },
  });

  async function onSubmit(data: RevisionRequestFormData) {
    setIsSubmitting(true);
    
    try {
      // Create FormData for server action
      const formData = new FormData();
      formData.append("orderId", orderId);
      formData.append("description", data.description);
      
      // Call server action
      const result = await createRevisionRequest(formData);
      
      if (result.success) {
        toast({
          title: "Revision Request Submitted",
          description: "The seller has been notified of your revision request.",
        });
        
        form.reset();
      } else {
        toast({
          title: "Error",
          description: "There was a problem submitting your revision request. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem submitting your revision request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What changes would you like the craftsperson to make?</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Please describe in detail what you'd like changed or improved..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Be specific and clear about what you'd like to be revised. Include measurements, colors, or any other details that will help the craftsperson understand your request.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Revision Request"
          )}
        </Button>
      </form>
    </Form>
  );
} 