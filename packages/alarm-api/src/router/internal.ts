import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { internalProcedure, mqttClient } from "../trpc";

export const alarmInternal = {
  activateAlarms: internalProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      await mqttClient.internal.triggerAlarm.mutate({ alarmId: input });
    }),
  deactivateAlarms: internalProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      await mqttClient.internal.resetAlarm.mutate({ alarmId: input });
    }),
} satisfies TRPCRouterRecord;
