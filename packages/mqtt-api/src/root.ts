import { mqttRouter } from "./router/mqtt";
import { createInternalTRPCRouter, createTRPCRouter } from "./trpc";




export const internalAppRouter = createInternalTRPCRouter({
  internal: mqttRouter,
});


// export type definition of API

export type InternalAppRouter = typeof internalAppRouter;

