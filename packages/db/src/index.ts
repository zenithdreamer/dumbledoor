 
import { PrismaClient } from "../node_modules/.prisma/client";

export * from "../node_modules/.prisma/client";

const globalClient: PrismaClient = new PrismaClient();

export const prisma = globalClient;
