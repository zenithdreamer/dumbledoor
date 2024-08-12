import { adminRouter } from "./router/door";
import { scannerRouter } from "./router/scanner";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  admin: adminRouter,
  scanner_naja: scannerRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
