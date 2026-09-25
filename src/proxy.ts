import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const publicRoutes = ["/login"];

export async function proxy(req: NextRequest) {
  const token = await getToken({ req });
  const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname);
  const isApiRoute = req.nextUrl.pathname.startsWith("/api/");
  const isAuthCallback = req.nextUrl.pathname.startsWith("/api/auth");

  if (isAuthCallback) {
    return NextResponse.next();
  }

  // API requests need a JSON 401 from their route handlers. Redirecting them
  // to /login returns HTML to fetch() callers and hides the expired session.
  if (isApiRoute) {
    return NextResponse.next();
  }

  if (!isPublicRoute && !token) {
    const redirectUrl = new URL("/login", req.url);
    redirectUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (req.nextUrl.pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     */
    "/((?!_next/static|_next/image|favicon.ico|images).*)",
  ],
};
