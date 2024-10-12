import { fileURLToPath } from "url";
import type { Request } from "express";
import * as trpcExpress from "@trpc/server/adapters/express";
import cors from "cors";
import express from "express";
import createJiti from "jiti";
import { Connection } from "rabbitmq-client";
import { createOpenApiExpressMiddleware } from "trpc-to-openapi";

import {
  appRouter,
  createInternalTRPCContext,
  createTRPCContext,
  internalAppRouter,
} from "@dumbledoor/door-api";

// Import env files to validate at build time. Use jiti so we can load .ts files in here.
createJiti(fileURLToPath(import.meta.url))("./env");

const rabbit = new Connection(process.env.RABBITMQ_URL);

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
        queueLog,
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
        headers: req.headers
      }),
  }),
);

app.listen(process.env.DOOR_SERVICE_PORT, () => {
  console.log(
    "Server started on http://localhost:" + process.env.DOOR_SERVICE_PORT,
  );
});

const pub = rabbit.createPublisher({
  confirm: true,
  maxAttempts: 3,
  exchanges: [{ exchange: "log", type: "topic" }],
});

const queueLog = (userId: string, action: string) => {
  pub.send(
    {
      durable: true,
      exchange: "log",
      routingKey: "log.create",
    },
    {
      user_id: userId,
      action,
      created_at: new Date().toISOString(),
    },
  );
};
