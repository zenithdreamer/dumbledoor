import type { TRPCRouterRecord } from "@trpc/server";
 import { TRPCError } from "@trpc/server";
import { z } from "zod";
import mqtt from 'mqtt';

const mqttClient = mqtt.connect('mqtt://localhost:1883');
import { internalProcedure } from "../trpc";

export const mqttRouter = {
    unlockDoor: internalProcedure
        .input(
            z.object({
                doorId: z.string()
            })
        )
        .mutation(async ({ input }) => {
            const { doorId } = input;

            // Use the MQTT client to publish a message to the topic
            mqttClient.publish(`door/${doorId}/unlock`, "Unlocking door", (err) => {
                if (err) {
                    throw new TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to unlock the door',
                    });
                }
            });

            return {
                success: true,
                message: `Door ${doorId} unlocked successfully`,
            };
        }),
} satisfies TRPCRouterRecord; 
