import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Check auth status
  const { data: { session } } = await supabase.auth.getSession();

  // Auth middleware for protected routes
  if (request.nextUrl.pathname.startsWith('/dashboard') ||
      request.nextUrl.pathname.startsWith('/profile') ||
      request.nextUrl.pathname.startsWith('/orders') ||
      request.nextUrl.pathname.startsWith('/messages')) {
    
    // If not logged in, redirect to login
    if (!session) {
      const redirectUrl = new URL('/auth/sign-in', request.url);
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
    
    // Check if user is onboarded
    // We could fetch from database here if needed
    const onboardingComplete = session.user.user_metadata?.is_onboarded;
    
    // If role selection not complete, redirect to role selection
    if (!onboardingComplete && 
        !request.nextUrl.pathname.startsWith('/role-selection') &&
        !request.nextUrl.pathname.startsWith('/craftsman-signup') &&
        !request.nextUrl.pathname.startsWith('/builder-signup')) {
      return NextResponse.redirect(new URL('/role-selection', request.url));
    }
  }

  // Special handling for role selection and profile setup pages
  if (request.nextUrl.pathname.startsWith('/role-selection') ||
      request.nextUrl.pathname.startsWith('/craftsman-signup') ||
      request.nextUrl.pathname.startsWith('/builder-signup')) {
    
    // Must be logged in to access these
    if (!session) {
      return NextResponse.redirect(new URL('/auth/sign-in', request.url));
    }
  }

  // Special handling for authentication pages
  if (request.nextUrl.pathname.startsWith('/auth')) {
    // If logged in, redirect away from auth pages
    if (session && !request.nextUrl.pathname.startsWith('/auth/verify')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return response;
}

// Only run middleware on these paths
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/orders/:path*',
    '/messages/:path*',
    '/craftsman-signup/:path*',
    '/builder-signup/:path*',
    '/role-selection/:path*',
    '/auth/:path*',
  ],
}; 