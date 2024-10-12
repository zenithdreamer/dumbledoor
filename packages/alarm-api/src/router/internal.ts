import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { prisma } from "@dumbledoor/alarm-db";

import { internalProcedure } from "../trpc";

export const alarmInternal = {

	activateAlarms: internalProcedure
		.input(z.void())
		.mutation(async () => {
			console.log("Activating alarms");
		}),
	deactivateAlarms: internalProcedure
		.input(z.void())
		.mutation(async () => {
			console.log("Deactivating alarms");
		}),

} satisfies TRPCRouterRecord;
