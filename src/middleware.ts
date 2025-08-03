import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const publicRoutes = ["/login"];
const publicApiRoutes = ["/api/steam", "/api/games", "/api/auth"];

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname);
  const isPublicApiRoute = publicApiRoutes.some(route => req.nextUrl.pathname.startsWith(route));
  const isAuthCallback = req.nextUrl.pathname.startsWith("/api/auth");

  if (isAuthCallback) {
    return NextResponse.next();
  }

  // Permitir APIs públicas sem autenticação
  if (isPublicApiRoute) {
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
