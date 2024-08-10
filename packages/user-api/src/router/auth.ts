import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { publicProcedure } from "../trpc";

export const authRouter = {
  signIn: publicProcedure
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      }),
    )
    .mutation(({ input }) => {
      const { username, password } = input;

      if (username !== "admin" || password !== "admin")
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid username or password",
        });

      //ctx.session = "nyan";
      return { success: true };
    }),
  // getSession: publicProcedure.query(({ ctx }) => {
  //   return ctx.session;
  // }),
  // signOut: protectedProcedure.mutation(async (opts) => {
  //   if (!opts.ctx.token) {
  //     return { success: false };
  //   }
  //   await invalidateSessionToken(opts.ctx.token);
  //   return { success: true };
  // }),
} satisfies TRPCRouterRecord;
