import { adminRouter } from "./router/auth";
import { userRouter } from "./router/user";
import { createInternalTRPCRouter, createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  admin: adminRouter,
});

export const internalAppRouter = createInternalTRPCRouter({
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
export type InternalAppRouter = typeof internalAppRouter;
