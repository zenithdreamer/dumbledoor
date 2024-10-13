import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { prisma } from "@dumbledoor/access-db";

import { protectedProcedure,notiClient } from "../trpc";

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
  getRoleById: protectedProcedure
    .input(z.string()) // Expecting a string as the role ID
    .query(async ({ ctx, input }) => {
      // Check if the user is an admin
      const user = await prisma.userAccess.findUnique({
        where: { user_id: ctx.session.userId },
      });

      if (!user?.admin) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to perform this action",
        });
      }

      // Fetch the role with its associated doors and users
      const role = await prisma.role.findUnique({
        where: { id: input }, // input is the role ID
        include: {
          role_doors: true,
          role_users: true,
        },
      });

      if (!role) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Role not found",
        });
      }

      return role;
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

      ctx.queueLog(ctx.session.userId, `Created a new role: ${role.name}`);

      await notiClient.internal.sentNotification.mutate({
        notiText: `Created a new role: ${role.name}`,
      });

      return role;
    }),

  updateRole: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        users: z.array(z.string()).optional(),
        doors: z
          .array(
            z.object({
              door_id: z.string(),
              granted_access_level: z.number().min(0).max(3),
            }),
          )
          .optional(),
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
        data: {
          name: input.name,
          description: input.description,
        },
      });

      if (input.doors) {
        // Remove all doors that binded to the role
        await prisma.roleDoor.deleteMany({
          where: { role_id: input.id },
        });

        // Assign doors to the role
        await prisma.roleDoor.createMany({
          data: input.doors.map((door) => ({
            role_id: input.id,
            door_id: door.door_id,
            granted_access_level: door.granted_access_level,
          })),
        });
      }

      if (input.users) {
        // Remove all user access that binded to the role
        await prisma.userAccess.updateMany({
          where: { role_id: input.id },
          data: { role_id: null },
        });

        // Assign users to the role
        await prisma.userAccess.updateMany({
          where: { user_id: { in: input.users } },
          data: { role_id: input.id },
        });
      }

      ctx.queueLog(
        ctx.session.userId,
        `Updated a role: ${role.name} (${role.id}) with a name: ${input.name} and description: ${input.description}`,
      );

      await notiClient.internal.sentNotification.mutate({
        notiText: `Updated role: ${role.name} (${role.id}) with a name: ${input.name} and description: ${input.description}`,
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
      const deletedUserAccess = await prisma.userAccess.updateMany({
        where: { role_id: input },
        data: { role_id: null },
      });

      // Remove all door that binded to the role
      const deletedRoleDoor = await prisma.roleDoor.deleteMany({
        where: { role_id: input },
      });

      // Remove the role
      await prisma.role.delete({
        where: { id: input },
      });

      ctx.queueLog(
        ctx.session.userId,
        `Deleted a role ${input}, changed ${deletedUserAccess.count} user access to no role, and  ${deletedRoleDoor.count} doors were affected`,
      );

      await notiClient.internal.sentNotification.mutate({
        notiText: `Deleted a role ${input}, changed ${deletedUserAccess.count} user access to no role, and  ${deletedRoleDoor.count} doors were affected`,
      });
      return true;
    }),
} satisfies TRPCRouterRecord;
