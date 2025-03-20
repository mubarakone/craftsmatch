"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createProductSchema, ProductDetailsFormValues, ProductImagesFormValues, ProductPricingFormValues, ProductAttributesFormValues } from "@/lib/validators/product";
import { createProduct } from "@/lib/products/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import ProductDetailsForm from "./product-details-form";
import ProductImagesForm from "./product-images-form";
import ProductPricingForm from "./product-pricing-form";
import ProductShippingForm from "./product-shipping-form";
import { toast } from "react-hot-toast";

type Step = "details" | "images" | "pricing" | "shipping";

export default function CreateProductForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("details");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Form data state
  const [formData, _setFormData] = useState<FormData>(new FormData());
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  
  // Track completion status of each step
  const [completed, setCompleted] = useState<Record<Step, boolean>>({
    details: false,
    images: false,
    pricing: false,
    shipping: false,
  });
  
  // Handle step completion
  const completeStep = (currentStep: Step, data: any) => {
    // Update completion status
    setCompleted((prev) => ({ ...prev, [currentStep]: true }));
    
    // Store form data for submission
    const stepFormData = new FormData();
    
    if (currentStep === "details") {
      const details = data as ProductDetailsFormValues;
      Object.entries(details).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          stepFormData.append(key, value.toString());
        }
      });
      
      // Merge with existing form data
      for (const [key, value] of stepFormData.entries()) {
        formData.set(key, value);
      }
    } 
    else if (currentStep === "images") {
      const images = data as ProductImagesFormValues;
      // Store image files for later submission
      setImageFiles(data.files);
    }
    else if (currentStep === "pricing") {
      const pricing = data as ProductPricingFormValues;
      Object.entries(pricing).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          stepFormData.append(key, value.toString());
        }
      });
      
      // Merge with existing form data
      for (const [key, value] of stepFormData.entries()) {
        formData.set(key, value);
      }
    }
    else if (currentStep === "shipping") {
      const shipping = data;
      // Add any shipping-specific data
      Object.entries(shipping).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          stepFormData.append(key, value.toString());
        }
      });
      
      // Merge with existing form data
      for (const [key, value] of stepFormData.entries()) {
        formData.set(key, value);
      }
    }
    
    // Move to next step or submit
    if (currentStep === "details") setStep("images");
    else if (currentStep === "images") setStep("pricing");
    else if (currentStep === "pricing") setStep("shipping");
    else if (currentStep === "shipping") handleSubmit();
  };
  
  // Handle back button
  const goBack = () => {
    if (step === "images") setStep("details");
    else if (step === "pricing") setStep("images");
    else if (step === "shipping") setStep("pricing");
  };
  
  // Submit the form data
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Add image files to form data
      imageFiles.forEach((file, index) => {
        formData.append(`images`, file);
      });
      
      const response = await createProduct(formData);
      
      if (response.success) {
        toast.success("Product created successfully!");
        router.push(`/dashboard/products/${response.productId}`);
      } else {
        toast.error(response.error || "Failed to create product");
      }
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("An error occurred while creating the product");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Render the current step form
  const renderStepForm = () => {
    switch (step) {
      case "details":
        return <ProductDetailsForm onComplete={(data) => completeStep("details", data)} initialData={formData} />;
      case "images":
        return <ProductImagesForm onComplete={(data) => completeStep("images", data)} />;
      case "pricing":
        return <ProductPricingForm onComplete={(data) => completeStep("pricing", data)} initialData={formData} />;
      case "shipping":
        return <ProductShippingForm onComplete={(data) => completeStep("shipping", data)} initialData={formData} />;
      default:
        return null;
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create New Product</CardTitle>
          <div className="flex items-center justify-between mt-2">
            <div className="flex space-x-2">
              <StepIndicator 
                step="details" 
                currentStep={step} 
                completed={completed.details} 
                onClick={() => completed.details && setStep("details")} 
              />
              <StepIndicator 
                step="images" 
                currentStep={step} 
                completed={completed.images} 
                onClick={() => completed.images && setStep("images")} 
              />
              <StepIndicator 
                step="pricing" 
                currentStep={step} 
                completed={completed.pricing} 
                onClick={() => completed.pricing && setStep("pricing")} 
              />
              <StepIndicator 
                step="shipping" 
                currentStep={step} 
                completed={completed.shipping} 
                onClick={() => completed.shipping && setStep("shipping")} 
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderStepForm()}
        </CardContent>
        <CardFooter className="flex justify-between">
          {step !== "details" && (
            <Button variant="outline" onClick={goBack} disabled={isSubmitting}>
              Back
            </Button>
          )}
          {step === "details" && (
            <Button variant="outline" onClick={() => router.push("/dashboard/products")} disabled={isSubmitting}>
              Cancel
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

// Step indicator component
interface StepIndicatorProps {
  step: Step;
  currentStep: Step;
  completed: boolean;
  onClick: () => void;
}

function StepIndicator({ step, currentStep, completed, onClick }: StepIndicatorProps) {
  const isActive = step === currentStep;
  const isClickable = completed;
  
  let className = "flex items-center justify-center h-8 w-8 rounded-full text-sm font-medium ";
  
  if (isActive) {
    className += "bg-primary text-primary-foreground";
  } else if (completed) {
    className += "bg-primary/20 text-primary cursor-pointer";
  } else {
    className += "bg-muted text-muted-foreground";
  }
  
  // Convert step to display name
  const stepName = {
    details: "Details",
    images: "Images",
    pricing: "Pricing",
    shipping: "Shipping",
  }[step];
  
  return (
    <div className="flex flex-col items-center">
      <div 
        className={className}
        onClick={isClickable ? onClick : undefined}
      >
        {completed ? "✓" : (isActive ? "•" : step.charAt(0).toUpperCase())}
      </div>
      <span className="text-xs mt-1">{stepName}</span>
    </div>
  );
} 