import { adminRouter } from "./router/door";
import { scannerRouter, scannerInternal } from "./router/scanner";
import { createTRPCRouter, createInternalTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  admin: adminRouter,
  scanner_naja: scannerRouter,
});

export const internalAppRouter = createInternalTRPCRouter({
  internal: scannerInternal
});
// export type definition of API
export type AppRouter = typeof appRouter;
export type InternalAppRouter = typeof internalAppRouter;
