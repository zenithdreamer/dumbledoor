import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { prisma } from "@dumbledoor/door-db";

import { cardClient, protectedProcedure } from "../trpc";

export const scannerRouter = {
  requestLock: protectedProcedure
    .input(
      z.object({
        cardId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const card = await cardClient.internal.getCards.mutate(input.cardId);
    }),

    
} satisfies TRPCRouterRecord;
