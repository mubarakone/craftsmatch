import { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Sign In | CraftsMatch",
  description: "Sign in to your CraftsMatch account",
};

export default function SignInPage() {
  return (
    <>
      <h1 className="text-center text-2xl font-semibold tracking-tight">
        Sign in to your account
      </h1>
      <AuthForm type="sign-in" />
    </>
  );
} 