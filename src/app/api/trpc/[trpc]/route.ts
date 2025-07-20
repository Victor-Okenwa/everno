/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import {type NextRequest, NextResponse } from "next/server";
import { env } from "~/env";
import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

export async function POST(req: NextRequest) {
  let setCookieValue: string | undefined;

  const handler = await fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () => {
      return createTRPCContext({ req, res: undefined as unknown as NextResponse<unknown> });
    },
    responseMeta: ({ data, paths }) => {
      if (
        paths?.some((p) =>
          ["auth.login", "auth.register", "auth.verifyOtp"].includes(p),
        ) &&
        data &&
        (data as any).setCookie
      ) {
        setCookieValue = (data as any).setCookie;
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

  const res = new NextResponse(handler.body, handler);
  if (setCookieValue) {
    res.headers.set("Set-Cookie", setCookieValue);
  }
  return res;
}

export { POST as GET };
