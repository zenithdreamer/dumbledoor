import { PrismaClient } from "../node_modules/.prisma/access-client";

export * from "../node_modules/.prisma/access-client";

const globalClient: PrismaClient = new PrismaClient();

export const prisma = globalClient;
