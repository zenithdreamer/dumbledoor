import * as trpcExpress from "@trpc/server/adapters/express";
import cors from "cors";
import express from "express";

import { appRouter, createTRPCContext } from "@dumbledoor/user-api";

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

app.listen(4000, () => {
  console.log("Server started on http://localhost:4000");
});
