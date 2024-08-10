import { doorRouter } from "./router/door";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  door: doorRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
