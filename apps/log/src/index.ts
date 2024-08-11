import { fileURLToPath } from "url";
import * as trpcExpress from "@trpc/server/adapters/express";
import cors from "cors";
import express from "express";
import createJiti from "jiti";
import { Connection } from "rabbitmq-client";

import { appRouter, createTRPCContext } from "@dumbledoor/log-api";
import { prisma } from "@dumbledoor/log-db";

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
        headers: req.headers,
        session: null,
      }),
  }),
);

app.listen(process.env.LOG_SERVICE_PORT, () => {
  console.log(
    "Server started on http://localhost:" + process.env.LOG_SERVICE_PORT,
  );
});

rabbit.on("error", (err) => {
  console.log("RabbitMQ connection error", err);
});

rabbit.on("connection", () => {
  console.log("RabbitMQ connected");
});

const sub = rabbit.createConsumer(
  {
    queue: "log",
    queueOptions: {
      durable: true,
    },
    qos: { prefetchCount: 2 },
    exchanges: [{ exchange: "log", type: "topic" }],
    queueBindings: [{ exchange: "log", routingKey: "log.*" }],
  },
  async (message) => {
    console.log("Received message", message.routingKey);
    if (message.routingKey === "log.create") {
      const newData = message.body;

      try {
        const log = await prisma.log.create({
          data: {
            user_id: newData.user_id,
            action: newData.action,
            created_at: new Date(newData.created_at),
          },
        });
      } catch (e) {
        console.error("Error updating user", e);
      }
    }
  },
);

sub.on("error", (err) => {
  console.log("consumer error (user-events)", err);
});
