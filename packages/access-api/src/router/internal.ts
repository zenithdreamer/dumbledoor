import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { prisma } from "@dumbledoor/access-db";

import { internalProcedure } from "../trpc";

export const internalRouter = {
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
  createUserAccess: internalProcedure
    .input(
      z.object({
        user_id: z.string(),
        role_id: z.string().nullable().optional(),
        accessLevel: z.number().optional().default(0),
        admin: z.boolean().optional().default(false),
      }),
    )
    .mutation(async ({ input }) => {
      const userAccess = await prisma.userAccess.findFirst({
        where: { user_id: input.user_id },
      });

      if (userAccess) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User access already exists",
        });
      }

      const createdUserAccess = await prisma.userAccess.create({
        data: {
          user_id: input.user_id,
          role_id: input.role_id,
          access_level: input.accessLevel,
          admin: input.admin,
        },
      });

      return createdUserAccess;
    }),
  updateUserAccess: internalProcedure
    .input(
      z.object({
        user_id: z.string(),
        role_id: z.string().nullable().optional(),
        accessLevel: z.number().optional(),
        admin: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const userAccess = await prisma.userAccess.findFirst({
        where: { user_id: input.user_id },
      });

      if (!userAccess) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const updatedUserAccess = await prisma.userAccess.update({
        where: { user_id: userAccess.user_id },
        data: {
          role: input.role_id ? { connect: { id: input.role_id } } : undefined,
          access_level: input.accessLevel,
          admin: input.admin,
        },
      });

      return updatedUserAccess;
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
        include: { role: true },
      });

      return users;
    }),
} satisfies TRPCRouterRecord;
