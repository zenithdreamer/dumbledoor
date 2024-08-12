import { fileURLToPath } from "url";
import * as trpcExpress from "@trpc/server/adapters/express";
import cors from "cors";
import express from "express";
import createJiti from "jiti";
import { Connection } from "rabbitmq-client";

import {
  appRouter,
  createTRPCContext,
  internalAppRouter,
} from "@dumbledoor/card-api";

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
  "/api/trpc-internal",
  trpcExpress.createExpressMiddleware({
    router: internalAppRouter,
    createContext: ({ req }) =>
      createTRPCContext({
        queueLog,
        headers: req.headers,
        session: null,
      }),
  }),
);

app.listen(process.env.CARD_SERVICE_PORT, () => {
  console.log(
    "Server started on http://localhost:" + process.env.CARD_SERVICE_PORT,
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
