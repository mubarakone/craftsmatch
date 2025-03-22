"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { craftsmanProfileSchema, CraftsmanProfileFormValues } from "@/lib/validators/profile";
import { updateUserRole, completeOnboarding } from "@/lib/auth/role-actions";

interface CraftsmanProfileFormProps {
  userId: string;
}

export function CraftsmanProfileForm({ userId }: CraftsmanProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CraftsmanProfileFormValues>({
    resolver: zodResolver(craftsmanProfileSchema),
  });

  const onSubmit = async (data: CraftsmanProfileFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      
      // Update user role first
      await updateUserRole("craftsman", userId);

      // Get the user's database ID
      const { data: userData, error: fetchError } = await supabase
        .from("users")
        .select("id")
        .eq("auth_id", userId)
        .single();

      if (fetchError) throw fetchError;
      
      // Create craftsman profile
      const { error: profileError } = await supabase
        .from("craftsman_profiles")
        .insert({
          user_id: userData.id,
          business_name: data.businessName,
          specialization: data.specialization,
          years_of_experience: parseInt(data.yearsOfExperience),
          description: data.description,
          location: data.location,
          phone_number: data.phoneNumber || null,
          website: data.website || null,
        });

      if (profileError) throw profileError;

      // Mark user as onboarded
      await completeOnboarding(userId);

      // Redirect to dashboard
      router.push("/dashboard/craftsman");
    } catch (error: any) {
      setError(error.message || "An error occurred while creating your profile.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8">
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <Label htmlFor="businessName">Business Name</Label>
          <Input
            id="businessName"
            {...register("businessName")}
            className="mt-1 block w-full"
            disabled={isLoading}
          />
          {errors.businessName && (
            <p className="mt-1 text-sm text-red-600">{errors.businessName.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            {...register("description")}
            rows={4}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="specialization">Specialization</Label>
          <Input
            id="specialization"
            {...register("specialization")}
            className="mt-1 block w-full"
            disabled={isLoading}
          />
          {errors.specialization && (
            <p className="mt-1 text-sm text-red-600">{errors.specialization.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="yearsOfExperience">Years of Experience</Label>
          <Input
            id="yearsOfExperience"
            type="number"
            min="0"
            {...register("yearsOfExperience")}
            className="mt-1 block w-full"
            disabled={isLoading}
          />
          {errors.yearsOfExperience && (
            <p className="mt-1 text-sm text-red-600">{errors.yearsOfExperience.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            {...register("location")}
            className="mt-1 block w-full"
            disabled={isLoading}
          />
          {errors.location && (
            <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
          <Input
            id="phoneNumber"
            {...register("phoneNumber")}
            className="mt-1 block w-full"
            disabled={isLoading}
          />
          {errors.phoneNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="website">Website (Optional)</Label>
          <Input
            id="website"
            {...register("website")}
            className="mt-1 block w-full"
            placeholder="https://yourwebsite.com"
            disabled={isLoading}
          />
          {errors.website && (
            <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
          )}
        </div>

        <div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              "Complete Profile"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
} 