import { PrismaClient } from "../node_modules/.prisma/user-client";

export * from "../node_modules/.prisma/user-client";

const globalClient: PrismaClient = new PrismaClient();

export const prisma = globalClient;
