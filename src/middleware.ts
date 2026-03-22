/**
 * Next.js Edge Middleware — route protection with backend-verified role checks.
 *
 * Security model:
 * - Presence of cookie is NOT enough for admin access.
 * - For /admin routes, role is verified against backend `/api/v1/auth/me`
 *   using the JWT in `mv_access`.
 * - Invalid/expired token clears auth cookies and redirects to login.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ACCESS_COOKIE = "mv_access";
const EXP_COOKIE = "mv_exp";
const SESSION_COOKIE = "mv_session";

const ADMIN_ROLES = new Set(["administrador", "gestor_tienda"]);
const ADMIN_ONLY_PREFIXES = ["/admin/usuarios"];
const MEMBER_PREFIXES = ["/cuenta", "/carrito", "/checkout"];
const PUBLIC_AUTH_PREFIXES = ["/login", "/registro"];
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function clearAuthCookies(response: NextResponse): void {
  for (const name of [ACCESS_COOKIE, EXP_COOKIE, SESSION_COOKIE]) {
    response.cookies.set({
      name,
      value: "",
      path: "/",
      expires: new Date(0),
      sameSite: "lax",
    });
  }
}

function redirectToLogin(request: NextRequest, pathname: string): NextResponse {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

async function resolveRoleFromBackend(token: string): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { role?: unknown };
    return typeof data.role === "string" ? data.role : null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value ?? null;

  if (pathname.startsWith("/admin")) {
    if (!accessToken) {
      return redirectToLogin(request, pathname);
    }

    const role = await resolveRoleFromBackend(accessToken);
    if (!role) {
      const response = redirectToLogin(request, pathname);
      clearAuthCookies(response);
      return response;
    }
    if (!ADMIN_ROLES.has(role)) {
      return NextResponse.redirect(new URL("/cuenta", request.url));
    }
    if (
      ADMIN_ONLY_PREFIXES.some((prefix) => pathname.startsWith(prefix)) &&
      role !== "administrador"
    ) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (MEMBER_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    if (!accessToken) {
      return redirectToLogin(request, pathname);
    }
    const role = await resolveRoleFromBackend(accessToken);
    if (!role) {
      const response = redirectToLogin(request, pathname);
      clearAuthCookies(response);
      return response;
    }
    return NextResponse.next();
  }

  if (PUBLIC_AUTH_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    if (!accessToken) {
      return NextResponse.next();
    }
    const role = await resolveRoleFromBackend(accessToken);
    if (!role) {
      const response = NextResponse.next();
      clearAuthCookies(response);
      return response;
    }
    const destination = ADMIN_ROLES.has(role) ? "/admin" : "/cuenta";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|webp|woff2?)).*)",
  ],
};
