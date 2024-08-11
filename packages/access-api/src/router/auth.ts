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

    const roles = await prisma.role.findMany();

    // Get all door assigned to each role
    const doors = await prisma.roleDoor.findMany();

    type ReturnData = (typeof roles)[0] & { doors: (typeof doors)[0][] };
    const rolesWithDoors: ReturnData[] = [];

    // Assign doors to each role
    roles.forEach((role) => {
      const roleDoors = doors.filter((door) => door.role_id === role.id);
      rolesWithDoors.push({ ...role, doors: roleDoors });
    });

    return rolesWithDoors;
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
} satisfies TRPCRouterRecord;
