import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Redirect root to my-studies
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/my-studies", request.url))
  }

  // Redirect /assessment/:id to /assessment/:id/wizard
  const assessmentMatch = pathname.match(/^\/assessment\/([^/]+)$/)
  if (assessmentMatch) {
    return NextResponse.redirect(new URL(`${pathname}/wizard`, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
