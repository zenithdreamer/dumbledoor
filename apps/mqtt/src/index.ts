import { fileURLToPath } from "url";
import * as trpcExpress from "@trpc/server/adapters/express";
import cors from "cors";
import express from "express";
import createJiti from "jiti";

import {
  internalAppRouter as appRouter,
  createInternalTRPCContext,
  internalAppRouter,
} from "@dumbledoor/mqtt-api";

// Import env files to validate at build time. Use jiti so we can load .ts files in here.
createJiti(fileURLToPath(import.meta.url))("./env");

const app = express();
app.use(
  cors({
    origin: "*",
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

app.listen(process.env.MQTT_SERVICE_PORT, () => {
  console.log(
    "Server started on http://localhost:" + process.env.MQTT_SERVICE_PORT,
  );
});
