/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const cookies = req.cookies;
  const token = cookies.get("auth");
  // console.log(token.value);
  

  if (token) {
    // Call API route to verify token
    const verifyResponse = await fetch(`${req.nextUrl.origin}/api/verify-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: token.value }),
    });
    
    const result = await verifyResponse.json();
    console.log(result)

    if (result.valid) {
      return NextResponse.next();
    }
  }
  // return NextResponse.redirect(new URL("/signin", req.url));
}

export const config = {
  matcher: ["/dashboard/:path*"],
};