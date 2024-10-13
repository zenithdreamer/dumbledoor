import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";
import fetch from 'node-fetch';
import { internalProcedure } from "../trpc";


const sendDiscordNotification = async (message: string) => {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  try {
    if (!webhookUrl) {
      throw new Error('DISCORD_WEBHOOK_URL is not defined');
    }

    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: message, 
      }),
    });
    console.log('Notification sent to Discord');
  } catch (error) {
    console.error('Failed to send notification to Discord', error);
  }
};

export const internalRouter = {
  sentNotification: internalProcedure
    .input(z.object({ notiText: z.string() }))
    .mutation(async ({ input }) => {
      console.log("sentNotification", input.notiText);

   
      await sendDiscordNotification(input.notiText);

      return true;
    }),
} satisfies TRPCRouterRecord;
