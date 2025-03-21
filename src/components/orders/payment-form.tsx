"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { BlockchainConnectUI } from "./blockchain-connect-ui";

// Payment validation schema
const creditCardSchema = z.object({
  cardNumber: z
    .string()
    .min(16, "Card number must be at least 16 digits")
    .max(19, "Card number cannot exceed 19 digits")
    .regex(/^[0-9]+$/, "Card number must contain only digits"),
  cardHolder: z.string().min(3, "Cardholder name is required"),
  expiryDate: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, "Expiry date must be in MM/YY format"),
  cvv: z
    .string()
    .min(3, "CVV must be at least 3 digits")
    .max(4, "CVV cannot exceed 4 digits")
    .regex(/^[0-9]+$/, "CVV must contain only digits"),
});

interface PaymentFormProps {
  orderId: string;
  order: any; // Replace with proper order type
}

export function PaymentForm({ orderId, order }: PaymentFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "blockchain">("card");

  const form = useForm<z.infer<typeof creditCardSchema>>({
    resolver: zodResolver(creditCardSchema),
    defaultValues: {
      cardNumber: "",
      cardHolder: "",
      expiryDate: "",
      cvv: "",
    },
  });

  const processCardPayment = async (values: z.infer<typeof creditCardSchema>) => {
    // This is just a placeholder for demo purposes
    // In a real application, you would integrate with a payment processor

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simulate successful payment
    return { success: true, transactionId: `TR-${Math.random().toString(36).substring(2, 10).toUpperCase()}` };
  };

  const processBlockchainPayment = async () => {
    // This is just a placeholder for future blockchain integration
    // In a real application, you would integrate with a blockchain wallet

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simulate successful payment
    return { success: true, transactionId: `BC-${Math.random().toString(36).substring(2, 10).toUpperCase()}` };
  };

  const onSubmit = async (values: z.infer<typeof creditCardSchema>) => {
    setIsSubmitting(true);
    try {
      let paymentResult;

      if (paymentMethod === "card") {
        paymentResult = await processCardPayment(values);
      } else {
        paymentResult = await processBlockchainPayment();
      }

      if (!paymentResult.success) {
        throw new Error("Payment failed. Please try again.");
      }

      // In a real application, you would update the order status in the database
      // For now, we'll just show a success message and redirect

      toast({
        title: "Payment Successful",
        description: `Your payment has been processed successfully. Transaction ID: ${paymentResult.transactionId}`,
      });

      // Redirect to order success page
      router.push(`/orders/${orderId}/success`);
    } catch (error) {
      console.error("Payment processing error:", error);
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Failed to process payment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border rounded-lg p-6">
      <Tabs defaultValue="card" onValueChange={(value) => setPaymentMethod(value as "card" | "blockchain")}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="card">Credit Card</TabsTrigger>
          <TabsTrigger value="blockchain">Blockchain (Demo)</TabsTrigger>
        </TabsList>
        
        <TabsContent value="card">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="cardNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="1234 5678 9012 3456"
                        {...field}
                        onChange={(e) => {
                          // Remove any non-digit characters
                          const value = e.target.value.replace(/\D/g, "");
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cardHolder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cardholder Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="MM/YY" 
                          {...field} 
                          onChange={(e) => {
                            // Format as MM/YY
                            let value = e.target.value.replace(/\D/g, "");
                            if (value.length > 2) {
                              value = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
                            }
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="cvv"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CVV</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="123" 
                          {...field} 
                          onChange={(e) => {
                            // Only allow digits
                            const value = e.target.value.replace(/\D/g, "");
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="pt-4">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Processing Payment..." : `Pay $${(
                    order.totalPrice + 
                    (order.shipping || 0) + 
                    (order.tax || 0)
                  ).toFixed(2)}`}
                </Button>
              </div>
            </form>
          </Form>
        </TabsContent>
        
        <TabsContent value="blockchain">
          <BlockchainConnectUI
            amount={order.totalPrice + (order.shipping || 0) + (order.tax || 0)}
            onPaymentSubmit={onSubmit}
            isSubmitting={isSubmitting}
          />
        </TabsContent>
      </Tabs>
      
      <div className="mt-6 pt-6 border-t">
        <div className="flex items-center justify-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
          </svg>
          <p className="text-sm text-muted-foreground">
            Your payment information is encrypted and secure
          </p>
        </div>
      </div>
    </div>
  );
} 