/* eslint-disable no-restricted-properties */
import { PrismaClient } from "../node_modules/.prisma/client";

export * from "../node_modules/.prisma/client";

const globalClient: PrismaClient = new PrismaClient({
  log:
    process.env.NODE_ENV === "_development"
      ? ["query", "error", "warn"]
      : ["error"],
});

export const prisma = globalClient;
