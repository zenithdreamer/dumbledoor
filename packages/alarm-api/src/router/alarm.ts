import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { prisma } from "@dumbledoor/alarm-db";

import { internalProcedure, protectedProcedure, accessClient, doorClient } from "../trpc";

export const adminRouter = {
    getAllAlarms: protectedProcedure.query(async ({ ctx }) => {
        const isAdmin = await accessClient.internal.isAdmin.mutate(
        ctx.session.userId,
        );
    
        if (!isAdmin)
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You are not allowed to view alarms",
        });
    
        return prisma.alarm.findMany
    }),
    create_alarm: protectedProcedure
        .input(
            z.object({
            doorid: z.string(),
        }),
        )
        .mutation(async ({ ctx, input }) => {
            const isAdmin = await accessClient.internal.isAdmin.mutate(
                ctx.session.userId,
                );

            if (!isAdmin)
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "You are not allowed to create an alarm",
                });
        const door = await doorClient.internal.getDoor.query({
            id: input.doorid,
        });

            if (!door)
            throw new TRPCError({
            code: "NOT_FOUND",
            message: "Door not found",
            });

            const alarm = await prisma.alarm.create({
            data: {
            
                door_id: door.id,
            },
        });

        ctx.queueLog(ctx.session.userId, `Created alarm for door ${door.name}`);

        return alarm;
    }),

    delete_alarm: protectedProcedure
        .input(z.string())
        .mutation(async ({ ctx, input }) => {
            const isAdmin = await accessClient.internal.isAdmin.mutate(
                ctx.session.userId,
            );

            if (!isAdmin)
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "You are not allowed to delete an alarm",
                });

            const alarm = await prisma.alarm.findUnique({
                where: {
                    id: input,
                },
            });

            if (!alarm)
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Alarm not found",
                });

            await prisma.alarm.delete({
                where: {
                    id: input,
                },
            });

            ctx.queueLog(ctx.session.userId, `Deleted alarm for door ${alarm.door_id}`);

            return alarm;
        }),
} satisfies TRPCRouterRecord;
