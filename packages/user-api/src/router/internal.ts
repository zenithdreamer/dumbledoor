import type { TRPCRouterRecord } from "@trpc/server";

import { prisma } from "@dumbledoor/user-db";

import { internalProcedure } from "../trpc";

export const internalRouter = {
  getUsers: internalProcedure.query(async () => {
    const users = await prisma.user.findMany();
    return users;
  }),
} satisfies TRPCRouterRecord;
