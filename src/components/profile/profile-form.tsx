"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import {
  craftsmanProfileSchema,
  builderProfileSchema
} from "@/lib/validators/profile";

interface ProfileFormProps {
  profile?: any;
  isCraftsman: boolean;
}

export function ProfileForm({ profile, isCraftsman }: ProfileFormProps) {
  if (isCraftsman) {
    return <CraftsmanProfileForm profile={profile} />;
  } else {
    return <BuilderProfileForm profile={profile} />;
  }
}

function CraftsmanProfileForm({ profile }: { profile?: any }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof craftsmanProfileSchema>>({
    resolver: zodResolver(craftsmanProfileSchema),
    defaultValues: profile ? {
      businessName: profile.business_name || "",
      specialization: profile.specialization || "",
      description: profile.description || "",
      location: profile.location || "",
      phoneNumber: profile.phone_number || "",
      website: profile.website || "",
    } : {}
  });

  const onSubmit = async (data: z.infer<typeof craftsmanProfileSchema>) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const supabase = createClient();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Not authenticated");

      // Craftsman profile form update
      const { error: profileError } = await supabase
        .from("craftsman_profiles")
        .upsert({
          user_id: user.id,
          business_name: data.businessName,
          specialization: data.specialization,
          description: data.description,
          location: data.location,
          phone_number: data.phoneNumber,
          website: data.website,
        });

      // Check for errors in profile update
      if (profileError) throw profileError;

      router.refresh();
      setSuccess("Profile updated successfully");
    } catch (error: any) {
      setError(error.message || "An error occurred while updating your profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 text-green-700 rounded-md text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            {...register("description")}
            className="mt-1 block w-full h-32 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
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
          <Label htmlFor="phoneNumber">Phone Number</Label>
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
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            {...register("website")}
            className="mt-1 block w-full"
            disabled={isLoading}
          />
          {errors.website && (
            <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Updating Profile...
            </span>
          ) : (
            "Update Profile"
          )}
        </Button>
      </form>
    </div>
  );
}

function BuilderProfileForm({ profile }: { profile?: any }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof builderProfileSchema>>({
    resolver: zodResolver(builderProfileSchema),
    defaultValues: profile ? {
      companyName: profile.company_name || "",
      projectTypes: profile.project_types || "",
      description: profile.description || "",
      location: profile.location || "",
      phoneNumber: profile.phone_number || "",
      website: profile.website || "",
    } : {}
  });

  const onSubmit = async (data: z.infer<typeof builderProfileSchema>) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const supabase = createClient();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Not authenticated");

      // Builder profile form update
      const { error: profileError } = await supabase
        .from("builder_profiles")
        .upsert({
          user_id: user.id,
          company_name: data.companyName,
          project_types: data.projectTypes,
          description: data.description,
          location: data.location,
          phone_number: data.phoneNumber,
          website: data.website,
        });

      // Check for errors in profile update
      if (profileError) throw profileError;

      router.refresh();
      setSuccess("Profile updated successfully");
    } catch (error: any) {
      setError(error.message || "An error occurred while updating your profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 text-green-700 rounded-md text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="companyName">Company Name</Label>
          <Input
            id="companyName"
            {...register("companyName")}
            className="mt-1 block w-full"
            disabled={isLoading}
          />
          {errors.companyName && (
            <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="projectTypes">Project Types</Label>
          <Input
            id="projectTypes"
            {...register("projectTypes")}
            className="mt-1 block w-full"
            disabled={isLoading}
          />
          {errors.projectTypes && (
            <p className="mt-1 text-sm text-red-600">{errors.projectTypes.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            {...register("description")}
            className="mt-1 block w-full h-32 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
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
          <Label htmlFor="phoneNumber">Phone Number</Label>
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
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            {...register("website")}
            className="mt-1 block w-full"
            disabled={isLoading}
          />
          {errors.website && (
            <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Updating Profile...
            </span>
          ) : (
            "Update Profile"
          )}
        </Button>
      </form>
    </div>
  );
} 