import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { prisma } from "@dumbledoor/door-db";

import { accessClient, protectedProcedure } from "../trpc";

export const doorRouter = {
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        accessLevel: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const isAdmin = await accessClient.user.isAdmin.mutate({
        userId: ctx.session.userId,
      });

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

        return door;
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create door",
        });
      }
    }),
} satisfies TRPCRouterRecord;
