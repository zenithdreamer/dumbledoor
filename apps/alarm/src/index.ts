import { fileURLToPath } from "url";
import * as trpcExpress from "@trpc/server/adapters/express";
import cors from "cors";
import express from "express";
import createJiti from "jiti";
import { createOpenApiExpressMiddleware } from "trpc-to-openapi";

import {
  appRouter,
  createInternalTRPCContext,
  createTRPCContext,
  internalAppRouter,
} from "@dumbledoor/alarm-api";

// Import env files to validate at build time. Use jiti so we can load .ts files in here.
createJiti(fileURLToPath(import.meta.url))("./env");

const app = express();
app.use(
  cors({
    origin: "*",
  }),
);

app.use(
  "/api/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext: ({ req }) =>
      createTRPCContext({
        headers: req.headers,
        session: null,
      }),
  }),
);

app.use(
  "/api/internal",
  createOpenApiExpressMiddleware({
    router: internalAppRouter,
    createContext: ({ req }: { req: Request }) =>
      createInternalTRPCContext({
        headers: req.headers,
      }),
    responseMeta: undefined,
    maxBodySize: undefined,
  }),
);

app.use(
  "/api/trpc-internal",
  trpcExpress.createExpressMiddleware({
    router: internalAppRouter,
    createContext: ({ req }) =>
      createInternalTRPCContext({
        headers: req.headers,
      }),
  }),
);

app.listen(process.env.ALARM_SERVICE_PORT, () => {
  console.log(
    "Server started on http://localhost:" + process.env.ALARM_SERVICE_PORT,
  );
});
