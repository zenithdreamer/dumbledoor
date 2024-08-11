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

      await accessClient.internal.updateUserAccess.mutate({
        user_id: user.id,
        role_id: input.role,
        accessLevel: input.accessLevel,
        admin: input.admin,
      });

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

      const user = await prisma.user.update({
        where: { id: input.id },
        data: {
          username: input.username,
          password: await argon2.hash(input.password),
          first_name: input.firstName,
          last_name: input.lastName,
        },
      });

      await accessClient.internal.updateUserAccess.mutate({
        user_id: user.id,
        role_id: input.role,
        accessLevel: input.accessLevel,
      });

      return user;
    }),
} satisfies TRPCRouterRecord;
