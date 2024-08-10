import { fileURLToPath } from "url";
import * as trpcExpress from "@trpc/server/adapters/express";
import argon2 from "argon2";
import cors from "cors";
import express from "express";
import createJiti from "jiti";

import { appRouter, createTRPCContext } from "@dumbledoor/user-api";
import { prisma } from "@dumbledoor/user-db";

// Import env files to validate at build time. Use jiti so we can load .ts files in here.
createJiti(fileURLToPath(import.meta.url))("./env");

// created for each request

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

app.listen(process.env.USER_SERVICE_PORT, () => {
  console.log("Server started on http://localhost:4000");

  bootstrapAdminAccount();
});

const bootstrapAdminAccount = async () => {
  // If there is no user in the database, create an admin account
  const result = await prisma.user.findMany();
  if (result.length > 0) {
    return;
  }

  const admin = await prisma.user.findUnique({
    where: { username: "admin" },
  });

  if (!admin) {
    await prisma.user.create({
      data: {
        username: "admin",
        password: await argon2.hash("admin"),
        first_name: "Admin",
        last_name: "DumbleDoor",
      },
    });

    console.log(
      "Admin account created with username: admin and password: admin",
    );
  }
};
