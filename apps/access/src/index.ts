import { fileURLToPath } from "url";
import * as trpcExpress from "@trpc/server/adapters/express";
import cors from "cors";
import express from "express";
import createJiti from "jiti";

import { appRouter, createTRPCContext } from "@dumbledoor/access-api";

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

app.listen(process.env.ACCESS_SERVICE_PORT, () => {
  console.log(
    "Server started on http://localhost:" + process.env.ACCESS_SERVICE_PORT,
  );
});
