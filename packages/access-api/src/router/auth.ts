import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";

import { prisma } from "@dumbledoor/access-db";

import { protectedProcedure } from "../trpc";

export const adminRouter = {
  getRoles: protectedProcedure.query(async ({ ctx }) => {
    const user = await prisma.userAccess.findUnique({
      where: { user_id: ctx.session.userId },
    });

    if (!user?.admin) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to perform this action",
      });
    }

    const roles = await prisma.role.findMany();
    return roles;
  }),
} satisfies TRPCRouterRecord;
