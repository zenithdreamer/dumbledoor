import { fileURLToPath } from "url";
import * as trpcExpress from "@trpc/server/adapters/express";
import argon2 from "argon2";
import cors from "cors";
import express from "express";
import createJiti from "jiti";
import { Connection } from "rabbitmq-client";

import { appRouter, createTRPCContext } from "@dumbledoor/user-api";
import { prisma } from "@dumbledoor/user-db";

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

app.listen(process.env.USER_SERVICE_PORT, () => {
  console.log("Server started on http://localhost:4000");
});

rabbit.on("error", (err) => {
  console.log("RabbitMQ connection error", err);
});
rabbit.on("connection", () => {
  console.log("RabbitMQ connected");
  bootstrapAdminAccount();
});

const bootstrapAdminAccount = async () => {
  // If there is no user in the database, create an admin account
  const result = await prisma.user.findMany();
  if (result.length > 0) {
    return;
  }

  const user = await prisma.user.create({
    data: {
      username: "admin",
      password: await argon2.hash("admin"),
      first_name: "Admin",
      last_name: "DumbleDoor",
    },
  });

  // Send queue to access-api to set user as admin
  const pub = rabbit.createPublisher({
    confirm: true,
    maxAttempts: 3,
    exchanges: [{ exchange: "access", type: "topic" }],
  });

  await pub.send(
    {
      durable: true,
      exchange: "access",
      routingKey: "user-access.create",
    },
    {
      id: user.id,
      admin: true,
    },
  );

  console.log("Admin account created with username: admin and password: admin");
  pub.close();
};

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
