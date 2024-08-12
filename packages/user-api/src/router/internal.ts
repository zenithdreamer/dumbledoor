import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { prisma } from "@dumbledoor/user-db";

import { internalProcedure } from "../trpc";

export const internalRouter = {
  getUser: internalProcedure.input(z.string()).query(async ({ input }) => {
    const user = await prisma.user.findUnique({
      where: { id: input },
    });
    return user;
  }),
  getUsers: internalProcedure.query(async () => {
    const users = await prisma.user.findMany();
    return users;
  }),
} satisfies TRPCRouterRecord;
