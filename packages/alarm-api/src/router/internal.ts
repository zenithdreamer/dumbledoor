import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { prisma } from "@dumbledoor/alarm-db";

import { internalProcedure, mqttClient } from "../trpc";

export const alarmInternal = {
  activateAlarms: internalProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      // Find the alarm of that door
      const alarms = await prisma.alarm.findMany({
        where: {
          door_id: input,
        },
      });
      for (const alarm of alarms) {
        await mqttClient.internal.triggerAlarm.mutate({ alarmId: alarm.id });
      }
    }),
  deactivateAlarms: internalProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      // Find the alarm of that door
      const alarms = await prisma.alarm.findMany({
        where: {
          door_id: input,
        },
      });
      for (const alarm of alarms) {
        await mqttClient.internal.resetAlarm.mutate({ alarmId: alarm.id });
      }
    }),
} satisfies TRPCRouterRecord;
