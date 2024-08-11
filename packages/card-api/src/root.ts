import { adminRouter } from "./router/card";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  admin: adminRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
