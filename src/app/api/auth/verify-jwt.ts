// pages/api/verify-token.ts
"use server";
import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

const SECRET = process.env.AUTH_SECRET!;

export async function verifyToken(token: string) {
  console.log(SECRET);
  try {
    return jwt.verify(token, SECRET) as { userId: string };
  } catch (error) {
    console.error("Token verification failed:", error);
    return null; // Invalid token
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: "Token is required" });
  }

  const decoded =  await verifyToken(String(token));
  if (decoded) {
    return res.status(200).json({ valid: true, userId: decoded.userId });
  }
  return res.status(401).json({ valid: false, error: "Invalid token" });
}
