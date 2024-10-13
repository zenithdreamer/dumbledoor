import { adminRouter } from "./router/alarm";
import { alarmInternal } from "./router/internal";
import { createInternalTRPCRouter, createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  admin: adminRouter,
});

export const internalAppRouter = createInternalTRPCRouter({
  internal: alarmInternal,
});

// export type definition of API
export type AppRouter = typeof appRouter;
export type InternalAppRouter = typeof internalAppRouter;
