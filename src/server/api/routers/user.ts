import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "../trpc";
import z from "zod";
import UserModel from "~/server/db/models/user";

export const userRouter = createTRPCRouter({
  createLink: publicProcedure
    .input(
      z.object({
        name: z.string().min(4),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = await UserModel.findById(ctx.user?.id);

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      console.log(user.links)

      if ((user.links || [{}]).find((link) => link.name === input.name)) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A link already has this name",
        });
      }

      //   user.links = [...(user.links || []), { name: input.name }];

      const result = await UserModel.findByIdAndUpdate(ctx.user?.id, {
        links: [...(user.links || []), { name: input.name }],
      });
      console.log("RESULT", result);
      return {
        links: result?.links,
      };
    }),
  getAllLinks: publicProcedure.query(async ({ ctx }) => {
    const user = await UserModel.findById(ctx.user?.id);

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    console.log(user);
    return {
      links: user.links || [],
    };
  }),
});
