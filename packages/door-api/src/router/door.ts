import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "@dumbledoor/door-db";
import { accessClient, protectedProcedure, notiClient } from "../trpc";

export const adminRouter = {
  getAllDoors: protectedProcedure.query(async ({ ctx }) => {
    const isAdmin = await accessClient.internal.isAdmin.mutate(
      ctx.session.userId,
    );

    if (!isAdmin)
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not allowed to view doors",
      });

    return prisma.door.findMany();
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        accessLevel: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const isAdmin = await accessClient.internal.isAdmin.mutate(
        ctx.session.userId,
      );

      if (!isAdmin)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not allowed to create a door",
        });

      try {
        const door = await prisma.door.create({
          data: {
            name: input.name,
            access_level: input.accessLevel,
            created_by: ctx.session.userId,
          },
        });

        const logMessage = `Created door ${door.name} with access level ${door.access_level}`;
        ctx.queueLog(ctx.session.userId, logMessage);

     
         await notiClient.internal.sentNotification.mutate({
          notiText: logMessage,
        }); 

        return door;
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create door",
        });
      }
    }),

  deleteDoor: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const isAdmin = await accessClient.internal.isAdmin.mutate(
        ctx.session.userId,
      );

      if (!isAdmin)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not allowed to delete a door",
        });

      await prisma.door.delete({
        where: { id: input },
      });

      const logMessage = `Deleted door ${input}`;
      ctx.queueLog(ctx.session.userId, logMessage);

      await notiClient.internal.sentNotification.mutate({
        notiText: logMessage,
      }); 
    }),

  editDoor: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        accessLevel: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const isAdmin = await accessClient.internal.isAdmin.mutate(
        ctx.session.userId,
      );

      if (!isAdmin)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not allowed to edit a door",
        });

      try {
        const door = await prisma.door.update({
          where: { id: input.id },
          data: {
            name: input.name,
            access_level: input.accessLevel,
          },
        });

        const logMessage = `Edited door ${door.name} (${door.id}) with access level ${door.access_level}`;
        ctx.queueLog(ctx.session.userId, logMessage);
        await notiClient.internal.sentNotification.mutate({
          notiText: logMessage,
        });

        return door;
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to edit door",
        });
      }
    }),
} satisfies TRPCRouterRecord;
