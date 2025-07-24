/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { serialize } from "cookie";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const SECRET = process.env.AUTH_SECRET!;
const MAX_AGE = 60 * 60 * 24 * 7; // 1 week

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function createToken(userId: string) {
  return jwt.sign({ userId }, SECRET, { expiresIn: MAX_AGE });
}

export const setAuthCookie = (token: string) => {
  return serialize("auth", token, {
    maxAge: MAX_AGE,
    path: "/",
    httpOnly: process.env.NODE_ENV === "production",
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    domain:
      process.env.NODE_ENV === "production" ? ".everno.vercel.app" : undefined,
  });
};

export function setTokenCookie(res: any, token: string) {
  const cookie = serialize("auth", token, {
    maxAge: MAX_AGE,
    expires: new Date(Date.now() + MAX_AGE * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });

  res.setHeader("Set-Cookie", cookie);
}

export const clearAuthCookie = () => {
  return serialize("auth", "", {
    maxAge: 0,
    path: "/",
    httpOnly: process.env.NODE_ENV === "production",
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    domain:
      process.env.NODE_ENV === "production" ? ".everno.vercel.app" : undefined,
  });
};

export function removeTokenCookie(res: any) {
  const cookie = serialize("auth", "", {
    maxAge: -1,
    path: "/",
  });

  res.setHeader("Set-Cookie", cookie);
}
