import { PrismaClient } from "@prisma/client";

export * from "@prisma/client";

const globalPrisma = globalThis as { prisma?: PrismaClient };

// eslint-disable-next-line
export const prisma =
  globalPrisma.prisma ??
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  new PrismaClient({
    log:
      // eslint-disable-next-line no-restricted-properties
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

// eslint-disable-next-line no-restricted-properties
if (process.env.NODE_ENV !== "production") globalPrisma.prisma = prisma;
