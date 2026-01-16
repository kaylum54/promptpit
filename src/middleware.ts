import { NextResponse, type NextRequest } from 'next/server';
import { auth0 } from '@/lib/auth0';

/**
 * Middleware for PromptPit
 * - Handles Auth0 authentication routes (/auth/*)
 * - Protects /dashboard routes (requires Pro tier)
 * - Redirects Pro users from home to dashboard
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Let Auth0 handle auth routes
  if (pathname.startsWith('/auth/')) {
    try {
      return await auth0.middleware(request);
    } catch (error) {
      console.error('Auth0 middleware error:', error);
      // Debug: Check which env vars are set (don't expose values)
      const envCheck = {
        AUTH0_SECRET: !!process.env.AUTH0_SECRET ? `set (${process.env.AUTH0_SECRET?.length} chars)` : 'MISSING',
        AUTH0_BASE_URL: process.env.AUTH0_BASE_URL || 'MISSING',
        AUTH0_ISSUER_BASE_URL: process.env.AUTH0_ISSUER_BASE_URL || 'MISSING',
        AUTH0_CLIENT_ID: !!process.env.AUTH0_CLIENT_ID ? `set (${process.env.AUTH0_CLIENT_ID?.length} chars)` : 'MISSING',
        AUTH0_CLIENT_SECRET: !!process.env.AUTH0_CLIENT_SECRET ? `set (${process.env.AUTH0_CLIENT_SECRET?.length} chars)` : 'MISSING',
      };
      // Return a more helpful error page
      return new NextResponse(
        JSON.stringify({
          error: 'Authentication error',
          message: error instanceof Error ? error.message : 'Unknown error',
          envCheck,
          hint: 'Check that URLs have https:// prefix and no trailing slashes'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }

  // Get session for other routes
  const session = await auth0.getSession();
  const user = session?.user;

  // =============================================
  // AUTHENTICATED USER REDIRECT FROM LOGIN
  // If user is already logged in, redirect to dashboard
  // =============================================
  if (pathname === '/login' && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // =============================================
  // PRO USER REDIRECT TO DASHBOARD
  // Pro users on home page get redirected to dashboard
  // =============================================
  if (pathname === '/' && user) {
    try {
      const baseUrl = request.nextUrl.origin;
      const profileRes = await fetch(`${baseUrl}/api/user/profile-check?userId=${encodeURIComponent(user.sub as string)}`, {
        headers: {
          cookie: request.headers.get('cookie') || '',
        },
      });

      if (profileRes.ok) {
        const profile = await profileRes.json();
        const isPro = profile?.tier === 'pro' || profile?.role === 'admin';

        if (isPro) {
          const url = request.nextUrl.clone();
          url.pathname = '/dashboard';
          return NextResponse.redirect(url);
        }
      }
    } catch (error) {
      console.error('Error checking profile in middleware:', error);
    }
  }

  // =============================================
  // DASHBOARD PROTECTION
  // Requires authentication (free or pro users can access)
  // =============================================
  if (pathname.startsWith('/dashboard')) {
    // Not logged in -> redirect to login
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    // Both free and pro users can access dashboard
    // Usage limits are enforced at the API level, not middleware
  }

  return NextResponse.next();
}

// Configure which routes use middleware
export const config = {
  matcher: [
    /*
     * Match:
     * - Auth routes (/auth/*)
     * - Home page (/)
     * - Login page (/login)
     * - Dashboard routes (/dashboard/*)
     *
     * Exclude:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     * - API routes (they handle their own auth)
     */
    '/',
    '/login',
    '/auth/:path*',
    '/dashboard/:path*',
  ],
};
