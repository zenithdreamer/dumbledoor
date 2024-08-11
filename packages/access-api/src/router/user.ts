import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { prisma } from "@dumbledoor/access-db";

import { internalProcedure } from "../trpc";

export const userRouter = {
  isAdmin: internalProcedure.input(z.string()).mutation(async ({ input }) => {
    const user = await prisma.userAccess.findFirst({
      where: { user_id: input },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Permission check failed, user not found",
      });
    }

    return user.admin;
  }),
  isAdminBatch: internalProcedure
    .input(z.array(z.string()))
    .mutation(async ({ input }) => {
      const users = await prisma.userAccess.findMany({
        where: { user_id: { in: input } },
      });

      return users.map((user) => user.admin);
    }),
  getUserAccessBatch: internalProcedure
    .input(z.array(z.string()))
    .mutation(async ({ input }) => {
      const users = await prisma.userAccess.findMany({
        where: { user_id: { in: input } },
      });

      return users;
    }),
} satisfies TRPCRouterRecord;
