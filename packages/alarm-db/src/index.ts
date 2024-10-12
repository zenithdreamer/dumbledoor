import { PrismaClient } from "../node_modules/.prisma/alarm-client";

export * from "../node_modules/.prisma/alarm-client";

const globalClient: PrismaClient = new PrismaClient();

export const prisma = globalClient;
