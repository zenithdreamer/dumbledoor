import { fileURLToPath } from "url";
import * as trpcExpress from "@trpc/server/adapters/express";
import cors from "cors";
import express from "express";
import createJiti from "jiti";

import { appRouter, createTRPCContext } from "@dumbledoor/access-api";

import { internalAppRouter } from "../../../packages/access-api/src/root";
import { createInternalTRPCContext } from "../../../packages/access-api/src/trpc";

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
