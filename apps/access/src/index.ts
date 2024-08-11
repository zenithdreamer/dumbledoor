import { fileURLToPath } from "url";
import * as trpcExpress from "@trpc/server/adapters/express";
import cors from "cors";
import express from "express";
import createJiti from "jiti";
import { Connection } from "rabbitmq-client";

import { appRouter, createTRPCContext } from "@dumbledoor/access-api";
import { prisma } from "@dumbledoor/access-db";

import { internalAppRouter } from "../../../packages/access-api/src/root";
import { createInternalTRPCContext } from "../../../packages/access-api/src/trpc";

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

app.listen(process.env.ACCESS_SERVICE_PORT, () => {
  console.log(
    "Server started on http://localhost:" + process.env.ACCESS_SERVICE_PORT,
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
    queue: "access",
    queueOptions: {
      durable: true,
    },
    qos: { prefetchCount: 2 },
    exchanges: [{ exchange: "access", type: "topic" }],
    queueBindings: [{ exchange: "access", routingKey: "user-access.*" }],
  },
  async (message) => {
    console.log("Received message", message.routingKey);
    if (message.routingKey === "user-access.edit") {
      const newData = message.body;

      try {
        // Update user in database
        const user = await prisma.userAccess.update({
          where: {
            user_id: newData.id,
          },
          data: {
            admin: newData.admin !== undefined ? newData.admin : undefined,
            access_level:
              newData.access_level !== undefined
                ? newData.access_level
                : undefined,
          },
        });
      } catch (e) {
        console.error("Error updating user", e);
      }
    } else if (message.routingKey === "user-access.create") {
      const newData = message.body;

      try {
        const user = await prisma.userAccess.create({
          data: {
            user_id: newData.id,
            admin: newData.admin !== undefined ? newData.admin : undefined,
            access_level:
              newData.access_level !== undefined ? newData.access_level : 3,
          },
        });
      } catch (e) {
        console.error("Error creating user", e);
      }
    }
  },
);

sub.on("error", (err) => {
  console.log("consumer error (user-events)", err);
});
