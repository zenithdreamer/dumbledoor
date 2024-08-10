import * as trpcExpress from "@trpc/server/adapters/express";
import express from "express";

import { appRouter, createTRPCContext } from "@dumbledoor/user-api";

// created for each request

const app = express();

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext: createTRPCContext,
  }),
);

app.listen(4000, () => {
  console.log("Server started on http://localhost:4000");
});
