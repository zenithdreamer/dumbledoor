import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { prisma } from "@dumbledoor/card-db";

import {
  accessClient,
  notiClient,
  protectedProcedure,
  userClient,
} from "../trpc";

export const adminRouter = {
  getAllCards: protectedProcedure.query(async ({ ctx }) => {
    const isAdmin = await accessClient.internal.isAdmin.mutate(
      ctx.session.userId,
    );

    if (!isAdmin)
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not allowed to view cards",
      });

    const cards = await prisma.card.findMany();
    const allAccess = await accessClient.internal.getAllUserAccess.query();
    const allUsers = await userClient.internal.getUsers.query();
    console.log(allUsers);

    type CardWithUserWithAccess = ((typeof cards)[0] & {
      user: (typeof allUsers)[0];
      access: (typeof allAccess)[0];
      assigned_by_user?: (typeof allUsers)[0];
    })[];
    const data: CardWithUserWithAccess = [];

    for (const card of cards) {
      const user = allUsers.find((user) => user.id === card.user_id);
      const access = allAccess.find(
        (access) => access.user_id === card.user_id,
      );

      const assigned_by_user = allUsers.find(
        (user) => user.id === card.assigned_by,
      );

      if (!user || !access) continue;

      data.push({
        ...card,
        user,
        access,
        assigned_by_user,
      });
    }

    return data;
  }),

  _getAllCards: protectedProcedure
    .meta({ openapi: { method: "PUT", path: "/cards" } })
    .input(z.void())
    .output(
      z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          user_id: z.string(),
          assigned_by: z.string(),
          created_at: z.date(),
          updated_at: z.date(),
        }),
      ),
    )
    .query(async ({ ctx }) => {
      const isAdmin = await accessClient.internal.isAdmin.mutate(
        ctx.session.userId,
      );

      if (!isAdmin)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not allowed to view cards",
        });

      const cards = await prisma.card.findMany();
      return cards;
    }),

  create: protectedProcedure
    .meta({ openapi: { method: "POST", path: "/card" } })
    .input(
      z.object({
        name: z.string(),
        userId: z.string(),
      }),
    )
    .output(
      z.object({
        id: z.string(),
        name: z.string(),
        user_id: z.string(),
        assigned_by: z.string(),
        created_at: z.date(),
        updated_at: z.date(),
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

      const user = await userClient.internal.getUser.query(input.userId);
      if (!user)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });

      try {
        const door = await prisma.card.create({
          data: {
            name: input.name,
            user_id: input.userId,
            assigned_by: ctx.session.userId,
          },
        });

        ctx.queueLog(
          ctx.session.userId,
          `Created card ${door.name} (${door.id}) for user ${door.user_id}`,
        );

        await notiClient.internal.sentNotification.mutate({
          notiText: `Created card ${door.name} (${door.id}) for user ${door.user_id}`,
        });

        return door;
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create card",
        });
      }
    }),

  _deleteCard: protectedProcedure
    .meta({ openapi: { method: "DELETE", path: "/card" } })
    .input(z.object({ id: z.string() }))
    .output(z.boolean())
    .mutation(async ({ ctx, input }) => {
      const isAdmin = await accessClient.internal.isAdmin.mutate(
        ctx.session.userId,
      );

      if (!isAdmin)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not allowed to delete a card",
        });

      await prisma.card.delete({
        where: { id: input.id },
      });

      ctx.queueLog(ctx.session.userId, `Deleted card ${input.id}`);
      return true;
    }),

  deleteCard: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const isAdmin = await accessClient.internal.isAdmin.mutate(
        ctx.session.userId,
      );

      if (!isAdmin)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not allowed to delete a card",
        });

      await prisma.card.delete({
        where: { id: input },
      });

      ctx.queueLog(ctx.session.userId, `Deleted card ${input}`);
    }),

  editCard: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        userId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const isAdmin = await accessClient.internal.isAdmin.mutate(
        ctx.session.userId,
      );

      if (!isAdmin)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not allowed to edit a card",
        });

      try {
        const door = await prisma.card.update({
          where: { id: input.id },
          data: {
            user_id: input.userId,
            name: input.name,
          },
        });

        ctx.queueLog(
          ctx.session.userId,
          `Edited card ${door.name} (${door.id}) for user ${door.user_id} with new name ${door.name}`,
        );

        return door;
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to edit door",
        });
      }
    }),
} satisfies TRPCRouterRecord;
