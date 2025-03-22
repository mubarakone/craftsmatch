"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function RoleSelectionForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRoleSelection = async (role: "craftsman" | "builder") => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Not authenticated");
      }

      // Temporarily store the role selection in local storage
      // This will be saved to the database during profile creation
      localStorage.setItem("selectedRole", role);

      // Redirect to the appropriate profile creation page
      if (role === "craftsman") {
        router.push("/craftsman-signup");
      } else {
        router.push("/builder-signup");
      }
    } catch (error: any) {
      setError(error.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {error && (
        <div className="col-span-2 mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <Card className="hover:border-primary/50 transition-colors">
        <CardHeader>
          <CardTitle>Craftsman</CardTitle>
          <CardDescription>
            For artisans, makers, and craftspeople who create and sell handmade products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            <li>Create and manage your product listings</li>
            <li>Receive and fulfill custom orders</li>
            <li>Connect with builders and contractors</li>
            <li>Showcase your portfolio and skills</li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={() => handleRoleSelection("craftsman")}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Continue as Craftsman"}
          </Button>
        </CardFooter>
      </Card>

      <Card className="hover:border-primary/50 transition-colors">
        <CardHeader>
          <CardTitle>Builder</CardTitle>
          <CardDescription>
            For builders, contractors, and designers who source handcrafted products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            <li>Browse and discover unique artisan products</li>
            <li>Request custom work and samples</li>
            <li>Connect directly with craftspeople</li>
            <li>Manage and track your orders</li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={() => handleRoleSelection("builder")}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Continue as Builder"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 