import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public routes that don't require authentication
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/marketplace") ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/craftsmen") ||
    pathname.startsWith("/products") && !pathname.includes("/manage/") && !pathname.includes("/edit") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  // If user is not signed in and the route is not public, redirect to sign in
  if (!session) {
    const redirectUrl = new URL("/sign-in", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is signed in but not onboarded and is trying to access protected routes
  if (
    session && 
    !pathname.startsWith("/role-selection") && 
    !pathname.startsWith("/craftsman-signup") && 
    !pathname.startsWith("/builder-signup")
  ) {
    // Check if user is onboarded
    const { data: userData } = await supabase
      .from("users")
      .select("is_onboarded, user_role")
      .eq("auth_id", session.user.id)
      .single();

    // If no user data or not onboarded, redirect to role selection
    if (!userData || !userData.is_onboarded) {
      return NextResponse.redirect(new URL("/role-selection", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}; 