import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname, basePath } = request.nextUrl
  const appBasePath = basePath || ""
  const normalizedPath =
    appBasePath && pathname.startsWith(appBasePath)
      ? pathname.slice(appBasePath.length) || "/"
      : pathname

  // Redirect /assessment/:id to /assessment/:id/wizard (but not /assessment/new)
  const assessmentMatch = normalizedPath.match(/^\/assessment\/([^/]+)$/)
  if (assessmentMatch && assessmentMatch[1] !== "new") {
    const url = request.nextUrl.clone()
    url.pathname = `${normalizedPath}/wizard`
    return NextResponse.redirect(url)
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
