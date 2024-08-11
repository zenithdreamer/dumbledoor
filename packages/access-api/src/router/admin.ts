import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

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

    const roles = await prisma.role.findMany({
      include: {
        role_doors: true,
        role_users: true,
      },
    });

    // Get all door assigned to each role
    //const doors = await prisma.roleDoor.findMany();

    //const users = await pris;

    // type ReturnData = (typeof roles)[0] & { doors: (typeof doors)[0][] };
    // const rolesWithDoors: ReturnData[] = [];

    // // Assign doors to each role
    // roles.forEach((role) => {
    //   const roleDoors = doors.filter((door) => door.role_id === role.id);
    //   rolesWithDoors.push({ ...role, doors: roleDoors });
    // });

    return roles;
  }),
  createRole: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await prisma.userAccess.findUnique({
        where: { user_id: ctx.session.userId },
      });

      if (!user?.admin) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to perform this action",
        });
      }

      const role = await prisma.role.create({
        data: input,
      });

      return role;
    }),
  updateRole: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await prisma.userAccess.findUnique({
        where: { user_id: ctx.session.userId },
      });

      if (!user?.admin) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to perform this action",
        });
      }

      const role = await prisma.role.update({
        where: { id: input.id },
        data: input,
      });

      return role;
    }),
  deleteRole: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const user = await prisma.userAccess.findUnique({
        where: { user_id: ctx.session.userId },
      });

      if (!user?.admin) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to perform this action",
        });
      }

      // Remove all user access with the role
      await prisma.userAccess.updateMany({
        where: { role_id: input },
        data: { role_id: null },
      });

      // Remove all door that binded to the role
      await prisma.roleDoor.deleteMany({
        where: { role_id: input },
      });

      // Remove the role
      await prisma.role.delete({
        where: { id: input },
      });

      return true;
    }),
} satisfies TRPCRouterRecord;
