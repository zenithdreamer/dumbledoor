import { PrismaClient } from "../node_modules/.prisma/door-client";

export * from "../node_modules/.prisma/door-client";

const globalClient: PrismaClient = new PrismaClient();

export const prisma = globalClient;
