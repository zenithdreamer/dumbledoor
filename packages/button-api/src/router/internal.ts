import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { doorClient, internalProcedure } from "../trpc";

export const internalRouter = {
  triggerButton: internalProcedure
    .input(z.object({ doorId: z.string() }))
    .output(z.boolean())
    .meta({ openapi: { method: "GET", path: "/triggerButton" } })
    .mutation(async ({ input }) => {
      try {
        await doorClient.internal.getDoor.query({
          id: input.doorId,
        });
      } catch (err) {
        console.log("Door not found", err);
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Door not found",
        });
      }

      return true;
    }),
} satisfies TRPCRouterRecord;
