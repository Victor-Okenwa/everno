/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const cookies = req.cookies;
  console.log("Cookies from req.cookies:", cookies);
  const token = cookies.get("auth");

  if (token) {
    // Call API route to verify token
    const verifyResponse = await fetch(`${req.nextUrl.origin}/api/verify-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: token.value }),
    });
    
    const result = await verifyResponse.json();

    if (result.valid) {
      return NextResponse.next();
    }
  }
  return NextResponse.redirect(new URL("/signin", req.url));
}

export const config = {
  matcher: ["/dashboard/:path*"],
};