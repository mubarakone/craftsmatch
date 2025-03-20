import { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Sign Up | CraftsMatch",
  description: "Create a new CraftsMatch account",
};

export default function SignUpPage() {
  return (
    <>
      <h1 className="text-center text-2xl font-semibold tracking-tight">
        Create a new account
      </h1>
      <AuthForm type="sign-up" />
    </>
  );
} 