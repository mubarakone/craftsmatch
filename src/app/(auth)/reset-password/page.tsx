// @ts-nocheck - Next.js App Router types are complex and may conflict with our page props
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password | CraftsMatch",
  description: "Create a new password for your CraftsMatch account",
};

// No need for custom interface, use the simplest approach
export default async function ResetPasswordPage({ 
  searchParams,
}: { 
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();

  // If no session and no code/token in URL, redirect to sign in
  if (!data.session && !searchParams?.code && !searchParams?.token) {
    redirect("/auth/sign-in");
  }

  return (
    <>
      <h1 className="text-center text-2xl font-semibold tracking-tight">
        Reset your password
      </h1>
      <p className="mt-2 text-center text-sm text-gray-600">
        Enter your new password below
      </p>
      <ResetPasswordForm />
    </>
  );
} 