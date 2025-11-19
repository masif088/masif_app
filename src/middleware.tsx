import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createServerClient } from '@supabase/ssr';

// Cache for session checks to prevent excessive calls
const sessionCache = new Map<string, { session: any; timestamp: number }>();
const CACHE_DURATION = 5000; // 5 seconds cache

// Rate limiting to prevent brute force
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW = 1000; // 1 second
const RATE_LIMIT_MAX = 10; // Max 10 requests per second per IP

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  
  // Rate limiting
  const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  const rateLimit = rateLimitMap.get(clientIP);
  
  if (rateLimit && (now - rateLimit.timestamp) < RATE_LIMIT_WINDOW) {
    if (rateLimit.count >= RATE_LIMIT_MAX) {
      console.log('Middleware: Rate limit exceeded for IP:', clientIP);
      return new NextResponse('Too Many Requests', { status: 429 });
    }
    rateLimit.count++;
  } else {
    rateLimitMap.set(clientIP, { count: 1, timestamp: now });
  }
  
  // Clean up old rate limit entries
  for (const [ip, data] of Array.from(rateLimitMap.entries())) {
    if (now - data.timestamp > RATE_LIMIT_WINDOW) {
      rateLimitMap.delete(ip);
    }
  }
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );
  
  const path = request.nextUrl.pathname;
  
  // Skip session check for static assets and API routes
  if (path.startsWith('/_next') || path.startsWith('/api') || path.includes('.')) {
    return res;
  }
  
  // Check cache first
  const cacheKey = request.cookies.toString();
  const cached = sessionCache.get(cacheKey);
  
  let session = null;
  
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    session = cached.session;
    console.log('Middleware: Using cached session for path:', path);
  } else {
    // Refresh session if expired or not cached
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    session = currentSession;
    
    // Cache the result
    sessionCache.set(cacheKey, { session, timestamp: now });
    
    // Clean up old cache entries
    for (const [key, value] of Array.from(sessionCache.entries())) {
      if (now - value.timestamp > CACHE_DURATION) {
        sessionCache.delete(key);
      }
    }
    
    console.log('Middleware: Fresh session check for path:', path, 'Session exists:', !!session);
  }
  
  // Check if user is trying to access authentication pages
  const isAuthPage = path.startsWith('/authentication');
  
  // Check if user is trying to access admin pages
  const isAdminPage = path.startsWith('/admin');
  
  // Check if user is trying to access dashboard pages
  const isDashboardPage = path.startsWith('/dashboard');
  
  // If user is not authenticated and trying to access protected pages
  if (!session && !isAuthPage && (isAdminPage || isDashboardPage || path === '/')) {
    console.log('Middleware: Redirecting unauthenticated user to login');
    return NextResponse.redirect(new URL("/authentication/login", request.url));
  }
  
  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (session && isAuthPage) {
    console.log('Middleware: Redirecting authenticated user to dashboard');
    return NextResponse.redirect(new URL("/dashboard/default", request.url));
  }
  
  // For admin pages, check if user has admin role (only if session exists)
  if (session && isAdminPage) {
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();
      
      // Allow access if user is admin or if role check fails (fallback)
      if (userData?.role !== 'Administrator') {
        console.log('Non-admin user trying to access admin page:', session.user.id);
        // You can either redirect to dashboard or show an error page
        return NextResponse.redirect(new URL("/dashboard/default", request.url));
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      // If we can't check the role, allow access (you might want to be more restrictive)
    }
  }
  
  return res;
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/widgets/:path*",
    "/app/:path*",
    "/forms/:path*",
    "/table/:path*",
    "/ui-kits/:path*",
    "/bonus-ui/:path*",
    "/icons/:path*",
    "/buttons/:path*",
    "/charts/:path*",
    "/editor/:path*",
    "/pages/sample-page",
    "/authentication/login",
    "/admin/:path*",
  ],
};
