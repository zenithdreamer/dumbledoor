import { PrismaClient } from "../node_modules/.prisma/card-client";

export * from "../node_modules/.prisma/card-client";

const globalClient: PrismaClient = new PrismaClient();

export const prisma = globalClient;
