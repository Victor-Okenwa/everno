import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import type { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "~/server/db/mongodb";
import UserModel, { type UserDocument } from "~/server/db/models/user";
import { verifyToken } from "~/app/api/auth/verify-jwt";

// export type ExtraResponse = NextResponse & {
//   setHeader: (name: string, value: string) => void;
//   cookies: { get: (name: string) => { value: string } | undefined };
// };
// Updated createTRPCContext to use NextRequest and NextResponse
export const createTRPCContext = async (opts: {
  req: NextRequest;
  res: NextResponse;
}) => {
  // Connect to MongoDB
  await connectToDatabase();

  // Get token from cookies using NextRequest's cookies property
  const token = opts.req.cookies.get("auth")?.value;
  let user: UserDocument | null = null;

  if (token) {
    try {
      const verifiedToken = await verifyToken(token); // Ensure userId is a string
      user = await UserModel.findById(verifiedToken?.userId).exec();

      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not found",
        });
      }
    } catch (error) {
      console.error("Invalid token or user fetch error:", error);
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid authentication token",
      });
    }
  }

  return {
    user,
    req: opts.req,
    res: opts.res, // Include res in the context
  };
};

// Update Context type to reflect the new return type
export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

// Rest of the file remains unchanged
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});
export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;

const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();
  if (t._config.isDev) {
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }
  const result = await next();
  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);
  return result;
});

export const publicProcedure = t.procedure.use(timingMiddleware);
export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    return next({ ctx: { user: ctx.user } });
  });
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user?.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
  return next();
});
