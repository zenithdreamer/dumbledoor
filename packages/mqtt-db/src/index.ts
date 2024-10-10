import { PrismaClient } from "../node_modules/.prisma/mqtt-client";

export * from "../node_modules/.prisma/mqtt-client";

const globalClient: PrismaClient = new PrismaClient();

export const prisma = globalClient;
