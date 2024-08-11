import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";

import { prisma } from "@dumbledoor/user-db";

import { accessClient, protectedProcedure } from "../trpc";

export const adminRouter = {
  getUsers: protectedProcedure.query(async ({ ctx }) => {
    const isAdmin = await accessClient.user.isAdmin.mutate(ctx.session.userId);
    if (!isAdmin) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to perform this action",
      });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        first_name: true,
        last_name: true,
        created_at: true,
        updated_at: true,
      },
    });

    const userIds = users.map((user) => user.id);
    const getUserAccessBatch =
      await accessClient.user.getUserAccessBatch.mutate(userIds);

    // Combine user data access data
    type ReturnType = (typeof users)[number] &
      (typeof getUserAccessBatch)[number];

    return users.map((user) => {
      const userAccess = getUserAccessBatch.find(
        (access) => access.user_id === user.id,
      );

      return {
        ...user,
        ...userAccess,
      } as ReturnType;
    });
  }),
} satisfies TRPCRouterRecord;
