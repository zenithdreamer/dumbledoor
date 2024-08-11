import { adminRouter } from "./router/admin";
import { authRouter } from "./router/auth";
import { internalRouter } from "./router/internal";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  admin: adminRouter,
});

export const internalAppRouter = createTRPCRouter({
  internal: internalRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
export type InternalAppRouter = typeof internalAppRouter;
