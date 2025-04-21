import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (
    path.split("/")[1] !== "authentication" &&
    !request.cookies.has("token")
  ) {
    return NextResponse.redirect(new URL("/authentication/login", request.url));
  }
  if (path.split("/")[1] === "authentication" && request.cookies.has("token")) {
    return NextResponse.redirect(new URL(`/dashboard/default`, request.url));
  }
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
  ],
};
