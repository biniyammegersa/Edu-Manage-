import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = [
  "/",
  "/login",
  "/signup",
  "/projects",
  "/api/auth/login",
  "/api/auth/signup",
];

// Define routes that are restricted to specific roles
const restrictedRoutes = {
  "/community": ["community"],
  "/home": ["admin", "teacher", "student"],
  "/profile": ["student", "admin", "teacher"],
  "/project": ["student", "admin", "teacher"],
  "/project/submit": ["student"],
  "/project/submitfeedback": ["teacher"],
  "/student": ["admin", "teacher"],
  "/students": ["admin", "teacher"],
  "/settings": ["student", "admin", "teacher", "community"],
  "/setting": ["student", "admin", "teacher"],
  "/proposal": ["student", "admin", "teacher"],
  "/proposal/submit": ["student"],
  "/proposal/submitfeedback": ["teacher"],
  "/mentor": ["admin", "teacher"],
  "/documentation": ["student", "teacher"],
  "/group": ["student", "admin", "teacher"],
  "/all-groups": ["admin", "teacher"],
  "/admin": ["admin"],
};

// Define specific routes that should be strictly restricted
const strictRoutes = {
  "/proposal/submitfeedback": ["teacher"],
  "/project/submitfeedback": ["teacher"],
  "/proposal/submit": ["student"],
  "/project/submit": ["student"],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Project details require login (guests can browse list at /projects only)
  if (pathname.startsWith("/project-detail")) {
    const token = request.cookies.get("access_token");
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Allow access to public routes, but redirect to /home if logged in and accessing /
  if (publicRoutes.includes(pathname)) {
    const token = request.cookies.get("access_token");
    if (token && (pathname === "/" || pathname === "/login" || pathname === "/signup")) {
      try {
        const tokenData = JSON.parse(atob(token.value.split(".")[1]));
        if (tokenData.role === "community") {
          return NextResponse.redirect(new URL("/community", request.url));
        }
      } catch {
        // fall through to default redirect
      }
      return NextResponse.redirect(new URL("/home", request.url));
    }
    return NextResponse.next();
  }

  const token = request.cookies.get("access_token");

  // Redirect to login if no token
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // Parse the JWT token to get user role
    const tokenData = JSON.parse(atob(token.value.split(".")[1]));
    const userRole = tokenData.role;

    // First check if the path matches any strict routes
    const strictMatch = Object.entries(strictRoutes).find(([route]) =>
      pathname.startsWith(route)
    );

    if (strictMatch) {
      const [route, allowedRoles] = strictMatch;
      if (!allowedRoles.includes(userRole)) {
        console.log(
          `Access denied: User with role ${userRole} attempted to access ${pathname}`
        );
        const fallback = userRole === "community" ? "/community" : "/";
        return NextResponse.redirect(new URL(fallback, request.url));
      }
      return NextResponse.next();
    }

    // If no strict match, check regular restricted routes
    const matchingRoute = Object.entries(restrictedRoutes).find(([route]) =>
      pathname.startsWith(route)
    );

    if (matchingRoute) {
      const [route, allowedRoles] = matchingRoute;
      if (!allowedRoles.includes(userRole)) {
        console.log(
          `Access denied: User with role ${userRole} attempted to access ${pathname}`
        );
        const fallback = userRole === "community" ? "/community" : "/";
        return NextResponse.redirect(new URL(fallback, request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    // If token is invalid, redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    "/project-detail/:path*",
    "/home/:path*",
    "/profile/:path*",
    "/project/:path*",
    "/student/:path*",
    "/students/:path*",
    "/setting/:path*",
    "/settings/:path*",
    "/proposal/:path*",
    "/mentor/:path*",
    "/documentation/:path*",
    "/group/:path*",
    "/all-groups/:path*",
    "/admin/:path*",
    "/community/:path*",
  ],
};
