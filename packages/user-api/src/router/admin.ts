import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import argon2 from "argon2";
import { z } from "zod";

import { prisma } from "@dumbledoor/user-db";

import { accessClient, protectedProcedure } from "../trpc";

export const adminRouter = {
  getUsers: protectedProcedure.query(async ({ ctx }) => {
    const isAdmin = await accessClient.internal.isAdmin.mutate(
      ctx.session.userId,
    );
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
      await accessClient.internal.getUserAccessBatch.mutate(userIds);

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
  createUser: protectedProcedure
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
        firstName: z.string(),
        lastName: z.string(),
        role: z.string().nullable(),
        accessLevel: z.number().default(0),
        admin: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const isAdmin = await accessClient.internal.isAdmin.mutate(
        ctx.session.userId,
      );
      if (!isAdmin) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to perform this action",
        });
      }

      const user = await prisma.user.create({
        data: {
          username: input.username,
          password: await argon2.hash(input.password),
          first_name: input.firstName,
          last_name: input.lastName,
        },
      });

      const newUser = await accessClient.internal.createUserAccess.mutate({
        user_id: user.id,
        role_id: input.role,
        accessLevel: input.accessLevel,
        admin: input.admin,
      });

      ctx.queueLog(
        user.id,
        `
        Created a new user ${user.username} ${newUser.user_id} (${user.first_name} ${user.last_name}) ${input.role ? `with role ${input.role}` : ""} ${input.accessLevel ? `with access level ${input.accessLevel}` : ""} ${input.admin ? "as admin" : ""}  
      `,
      );
      return user;
    }),
  updateUser: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        username: z.string(),
        password: z.string(),
        firstName: z.string(),
        lastName: z.string(),
        role: z.string().nullable().optional(),
        accessLevel: z.number().optional(),
        admin: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const isAdmin = await accessClient.internal.isAdmin.mutate(
        ctx.session.userId,
      );

      if (!isAdmin) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to perform this action",
        });
      }

      // If user trying to make themselves not admin, prevent it
      if (input.id === ctx.session.userId && input.admin === false) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You cannot remove your own admin access",
        });
      }

      const oldUser = await prisma.user.findUnique({
        where: { id: input.id },
      });

      if (!oldUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const user = await prisma.user.update({
        where: { id: input.id },
        data: {
          username: input.username,
          password:
            input.password && input.password !== ""
              ? await argon2.hash(input.password)
              : undefined,
          first_name: input.firstName,
          last_name: input.lastName,
        },
      });

      await accessClient.internal.updateUserAccess.mutate({
        user_id: user.id,
        role_id: input.role,
        accessLevel: input.accessLevel,
      });

      ctx.queueLog(
        user.id,
        `
        Updated user ${oldUser.username} ${oldUser.id} (${oldUser.first_name} ${oldUser.last_name}) ${input.role ? `with role ${input.role}` : ""} ${input.accessLevel ? `with access level ${input.accessLevel}` : ""} ${input.admin ? "as admin" : ""}  
        From ${oldUser.username} ${oldUser.id} (${oldUser.first_name} ${oldUser.last_name}) 
      `,
      );

      return user;
    }),
  deleteUser: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const isAdmin = await accessClient.internal.isAdmin.mutate(
        ctx.session.userId,
      );

      if (!isAdmin) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to perform this action",
        });
      }

      if (input === ctx.session.userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You cannot delete your own account",
        });
      }

      await accessClient.internal.purgeUser.mutate(input);

      await prisma.user.delete({
        where: { id: input },
      });

      ctx.queueLog(input, `Deleted user ${input}`);

      return true;
    }),
  purgeInvalidUsers: protectedProcedure.mutation(async ({ ctx }) => {
    const isAdmin = await accessClient.internal.isAdmin.mutate(
      ctx.session.userId,
    );

    if (!isAdmin) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to perform this action",
      });
    }

    const users = await prisma.user.findMany();

    const userAccess = await accessClient.internal.getAllUserAccess.query();

    // From userAccess, get all user ids that are not in users table
    const invalidUserIds = userAccess
      .map((access) => access.user_id)
      .filter((userId) => !users.find((user) => user.id === userId));

    // Remove invalid users
    await Promise.all(
      invalidUserIds.map(async (userId) => {
        await accessClient.internal.purgeUser.mutate(userId);

        console.log(`User ${userId} removed`);
      }),
    );

    ctx.queueLog(
      ctx.session.userId,
      `Ran a debug command: Purged ${invalidUserIds.length} invalid users`,
    );

    return true;
  }),
} satisfies TRPCRouterRecord;
