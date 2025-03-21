"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useMobileDetection } from "@/lib/hooks/use-mobile-detection";

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useMobileDetection();

  // Close mobile menu when navigating or on desktop
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMobile) setIsOpen(false);
  }, [isMobile]);

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      <Button variant="ghost" size="icon" onClick={toggleMenu} className="lg:hidden">
        <Menu className="h-6 w-6" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      {isOpen && (
        <>
          <div className="mobile-nav-overlay" onClick={toggleMenu} />
          <nav className="mobile-nav-container">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Menu</h2>
              <Button variant="ghost" size="icon" onClick={toggleMenu}>
                <X className="h-6 w-6" />
                <span className="sr-only">Close menu</span>
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto py-2">
              {/* Guest navigation - we'll add user-specific navigation later */}
              <div className="space-y-1 px-3 py-2">
                <MobileNavLink href="/" active={pathname === "/"}>
                  Home
                </MobileNavLink>
                <MobileNavLink href="/marketplace" active={pathname === "/marketplace"}>
                  Marketplace
                </MobileNavLink>
                <MobileNavLink href="/search" active={pathname === "/search"}>
                  Search Products
                </MobileNavLink>
                
                <div className="mt-6 px-3 space-y-3">
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={() => router.push("/sign-in")}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push("/sign-up")}
                  >
                    Create Account
                  </Button>
                </div>
              </div>
            </div>
          </nav>
        </>
      )}
    </>
  );
}

interface MobileNavLinkProps {
  href: string;
  active: boolean;
  children: React.ReactNode;
}

function MobileNavLink({ href, active, children }: MobileNavLinkProps) {
  return (
    <Link
      href={href}
      className={`flex items-center px-3 py-2 rounded-md text-sm ${
        active
          ? "bg-primary/10 text-primary font-medium"
          : "text-foreground hover:bg-accent hover:text-accent-foreground"
      }`}
    >
      {children}
    </Link>
  );
} 