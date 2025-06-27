import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            req.cookies.set({
              name,
              value,
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: req.headers,
              },
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          } catch (error) {
            // Ignore cookie setting errors in middleware
          }
        },
        remove(name: string, options: any) {
          try {
            req.cookies.set({
              name,
              value: '',
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: req.headers,
              },
            })
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          } catch (error) {
            // Ignore cookie setting errors in middleware
          }
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/api']
  const isPublicRoute = publicRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )

  // Static files and assets
  const isStaticFile = req.nextUrl.pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|webp|css|js)$/)
  
  if (isStaticFile) {
    return response
  }

  // If no user and trying to access any non-public route, redirect to login
  if (!user && !isPublicRoute) {
    const loginUrl = new URL('/login', req.url)
    if (req.nextUrl.pathname !== '/') {
      loginUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname)
    }
    return NextResponse.redirect(loginUrl)
  }

  // If authenticated user is trying to access login page, redirect to dashboard
  if (user && req.nextUrl.pathname === '/login') {
    const redirectTo = req.nextUrl.searchParams.get('redirectedFrom') || '/dashboard'
    return NextResponse.redirect(new URL(redirectTo, req.url))
  }

  // If authenticated user is accessing root path, redirect to dashboard
  if (user && req.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
