import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { z } from "zod";

import { env } from "@dumbledoor/auth/env";
import { prisma } from "@dumbledoor/user-db";

import { publicProcedure } from "../trpc";

export const authRouter = {
  signIn: publicProcedure
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { username, password } = input;
      const user = await prisma.user.findUnique({
        where: { username },
      });

      if (!user) {
        // Perform a fake verification to consume the same amount of time for security reasons
        const fakeHash = await argon2.hash("fake-hash");
        await argon2.verify(fakeHash, password);
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid username or password",
        });
      }
      const isCredentialsValid = await argon2.verify(user.password, password);

      if (!isCredentialsValid)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid username or password",
        });

      // Issue JWT token
      const token = jwt.sign({ userId: user.id }, env.AUTH_SECRET);

      ctx.session = { userId: user.id };
      ctx.queueLog(user.id, "Successful sign in");
      return { success: true, token };
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
