import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { prisma } from "@dumbledoor/door-db";
import { accessClient, cardClient, protectedProcedure } from "../trpc";

export const scannerRouter = {
  requestLock: protectedProcedure
    .input(
      z.object({
        cardId: z.string(),
        doorId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Fetch the card details
      const card = await cardClient.internal.getCards.mutate(input.cardId);
      
      // Fetch the user's access level
      const accessList = await accessClient.internal.getUserAccessBatch.mutate([card.user_id]);

      if (accessList.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Access not found for the provided card ID",
        });
      }

      const door = await prisma.door.findUnique({
        where: {
          id: input.doorId,
        },
      });

      if (!door) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Door not found for the provided door ID",
        });
      }

      const userAccess = accessList[0]; // Assuming there's only one access record to check

      const personalAccessLevel = userAccess?.access_level;
   
      const doorAccessLevel = door.access_level; // Required door access level

      if (personalAccessLevel !== undefined && personalAccessLevel >= doorAccessLevel) {

        return true;
      }

      return false;
    }),
} satisfies TRPCRouterRecord;
