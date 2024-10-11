import { adminRouter } from "./router/door";
import { internalRouter } from "./router/internal";
import { scannerRouter } from "./router/scanner";
import { createInternalTRPCRouter, createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  admin: adminRouter,
  scanner_naja: scannerRouter,
});

export const internalAppRouter = createInternalTRPCRouter({
  internal: internalRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
export type InternalAppRouter = typeof internalAppRouter;
