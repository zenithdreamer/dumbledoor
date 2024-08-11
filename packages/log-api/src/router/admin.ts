import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";

import { prisma } from "@dumbledoor/log-db";

import { accessClient, protectedProcedure } from "../trpc";

export const adminRouter = {
  getAllLogs: protectedProcedure.query(async ({ ctx }) => {
    const isAdmin = await accessClient.internal.isAdmin.mutate(
      ctx.session.userId,
    );

    if (!isAdmin)
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not allowed to view logs",
      });

    const logs = await prisma.log.findMany();

    return logs;
  }),
} satisfies TRPCRouterRecord;
