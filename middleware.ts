import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(20, "1 s"),
});

export default async function middleware(req: NextRequest) {
  const response = NextResponse.next();

  // Rate limiting
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "127.0.0.1";
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: response.headers,
    });
  }

  const { pathname } = req.nextUrl;

  // Allow requests to the API routes
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Allow requests to the login page
  if (pathname === "/login") {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to the login page
  if (!token && pathname !== "/login") {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If the user is authenticated and trying to access the login page, redirect to home
  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
