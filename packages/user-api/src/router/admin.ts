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
    const isAdminBatch = await accessClient.user.isAdminBatch.mutate(userIds);

    type UserWithAdmin = (typeof users)[number] & { admin: boolean };
    const usersWithAdmin: UserWithAdmin[] = users.map((user, index) => {
      return { ...user, admin: isAdminBatch[index] ?? false };
    });

    return usersWithAdmin;
  }),
} satisfies TRPCRouterRecord;
