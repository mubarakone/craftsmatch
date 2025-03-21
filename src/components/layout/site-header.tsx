import Link from "next/link";
import { MainNav } from "./main-nav";
import { MobileNavigation } from "@/components/mobile/mobile-navigation";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">CraftsMatch</span>
          </Link>
          <MainNav />
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex gap-2">
            <Link
              href="/sign-in"
              className="text-sm font-medium text-muted-foreground hover:text-primary"
            >
              Sign In
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link
              href="/sign-up"
              className="text-sm font-medium text-muted-foreground hover:text-primary"
            >
              Sign Up
            </Link>
          </div>
          <MobileNavigation />
        </div>
      </div>
    </header>
  );
} 