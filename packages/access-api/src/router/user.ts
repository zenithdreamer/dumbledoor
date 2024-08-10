import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { z } from "zod";

import { prisma } from "@dumbledoor/access-db";
import { env } from "@dumbledoor/auth/env";

import { protectedProcedure } from "../trpc";

export const userRouter = {
  isAdmin: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const user = await prisma.userAccess.findUnique({
        where: { id: input.userId },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return user.admin;
    }),
} satisfies TRPCRouterRecord;
