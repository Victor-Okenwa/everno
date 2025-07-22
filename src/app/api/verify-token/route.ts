import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET = process.env.AUTH_SECRET!;

export async function POST(req: Request) {
  const { token } = (await req.json()) as { token: string };

  // Simulate token verification (replace with actual logic)
  try {
    const isValid = jwt.verify(token, SECRET) as { userId: string };

    if (!isValid) {
        throw new Error("Invalid token");
    }
    return NextResponse.json({ valid: true, userId: isValid.userId });
  } catch (error) {
    console.error("Token verification failed:", error);
  }

  return NextResponse.json({ valid: false }, { status: 401 });
}
