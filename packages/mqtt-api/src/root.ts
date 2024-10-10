import { mqttRouter } from "./router/mqtt";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  mqtt: mqttRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
