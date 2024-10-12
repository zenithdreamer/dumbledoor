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
      mqttClient.publish(`door/${doorId}/unlock`, "Unlocking door", (err) => {
        if (err) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to unlock the door",
          });
        }
      });

      return {
        success: true,
        message: `Door ${doorId} unlocked successfully`,
      };
    }),
} satisfies TRPCRouterRecord;
