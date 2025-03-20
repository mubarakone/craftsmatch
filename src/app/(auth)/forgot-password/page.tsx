import { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Forgot Password | CraftsMatch",
  description: "Reset your CraftsMatch password",
};

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="text-center text-2xl font-semibold tracking-tight">
        Forgot your password?
      </h1>
      <p className="mt-2 text-center text-sm text-gray-600">
        {/* eslint-disable-next-line react/no-unescaped-entities */}
        Enter your email address and we'll send you a link to reset your password.
      </p>
      <AuthForm type="forgot-password" />
    </>
  );
} 