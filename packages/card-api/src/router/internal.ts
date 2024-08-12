import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { prisma } from "@dumbledoor/card-db";

import { internalProcedure } from "../trpc";

export const internalRouter = {
  getAllCards: internalProcedure.mutation(async () => {
    const cards = await prisma.card.findMany();
    return cards;
  }),

  getCards: internalProcedure.input(z.string()).mutation(async ({ input }) => {
    const card = await prisma.card.findUnique({
      where: {
        id: input,
      },
    });

    if (!card) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Card not found",

      });
      
    }

    return card;
  }),
} satisfies TRPCRouterRecord;
