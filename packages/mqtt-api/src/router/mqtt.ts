import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import mqtt from "mqtt";
import { z } from "zod";

import { internalProcedure } from "../trpc";

const mqttClient = mqtt.connect(
  process.env.MQTT_BROKER_URL ?? "mqtt://localhost:1883",
);

console.log("Connected to MQTT broker: ", process.env.MQTT_BROKER_URL);

export const mqttRouter = {
  unlockDoor: internalProcedure
    .input(
      z.object({
        doorId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { doorId } = input;

      // Use the MQTT client to publish a message to the topic
      // mqttClient.publish(`dumbledoor-door/${doorId}`, "Unlocking door", (err) => {
      //   if (err) {
      //     throw new TRPCError({
      //       code: "INTERNAL_SERVER_ERROR",
      //       message: "Failed to unlock the door",
      //     });
      //   }
      // });

      return {
        success: true,
        message: `Door ${doorId} unlocked successfully`,
      };
    }),
  triggerAlarm: internalProcedure
    .input(
      z.object({
        alarmId: z.string(),
      }),
    )
    .mutation(({ input }) => {
      const { alarmId } = input;

      // Use the MQTT client to publish a message to the topic
      mqttClient.publish(`dumbledoor-alarm/${alarmId}`, "true", (err) => {
        if (err) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to trigger the alarm",
          });
        }
      });

      return {
        success: true,
        message: `Alarm ${alarmId} triggered successfully`,
      };
    }),
  resetAlarm: internalProcedure
    .input(
      z.object({
        alarmId: z.string(),
      }),
    )
    .mutation(({ input }) => {
      const { alarmId } = input;

      // Use the MQTT client to publish a message to the topic
      mqttClient.publish(`dumbledoor-alarm/${alarmId}`, "false", (err) => {
        if (err) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to reset the alarm",
          });
        }
      });

      return {
        success: true,
        message: `Alarm ${alarmId} reset successfully`,
      };
    }),
} satisfies TRPCRouterRecord;
