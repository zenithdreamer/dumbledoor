import { adminRouter } from "./router/auth";
import { internalRouter } from "./router/internal";
import { createInternalTRPCRouter, createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  admin: adminRouter,
});

export const internalAppRouter = createInternalTRPCRouter({
  internal: internalRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
export type InternalAppRouter = typeof internalAppRouter;
