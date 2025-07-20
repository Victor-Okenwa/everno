/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest, NextResponse } from "next/server";
import { env } from "~/env";
import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

const setCookiePaths = [
  "auth.login",
  "auth.register",
  "auth.verifyOtp",
]

// Create context with both req and res
const createContext = async (req: NextRequest) => {
  const res = new NextResponse(); // Create a new response object
  return createTRPCContext({ req, res });
};

const handler = (req: NextRequest) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext(req),
    responseMeta: ({ ctx, data, paths }) => {
      if (
        paths?.some((p)=> setCookiePaths.includes(p)) &&
        data &&
        (data as any).setCookie
        // ctx?.res instanceof NextResponse
      ) {
        console.log("Setting cookie in responseMeta:", (data as any).setCookie);
        return {
          headers: {
            "Set-Cookie": (data as any).setCookie,
          },
        };
      }
      return {};
    },
    onError:
      env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
            );
          }
        : undefined,
  });
};

export { handler as GET, handler as POST };
