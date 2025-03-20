import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <Logo className="mx-auto h-12 w-auto" />
          </Link>
          <h2 className="mt-6 text-3xl font-semibold text-gray-900">
            CraftsMatch
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Connecting Craftsmen and Builders
          </p>
        </div>
        {children}
      </div>
    </div>
  );
} 