import { PrismaClient } from "../node_modules/.prisma/log-client";

export * from "../node_modules/.prisma/log-client";

const globalClient: PrismaClient = new PrismaClient();

export const prisma = globalClient;
