/* eslint-disable no-restricted-properties */
import { createEnv } from "@t3-oss/env-nextjs";
import { vercel } from "@t3-oss/env-nextjs/presets";
import { z } from "zod";

import { env as authEnv } from "@dumbledoor/auth/env";

export const env = createEnv({
  extends: [authEnv, vercel()],
  shared: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    USER_SERVICE_URL: z.string().optional(),
    ACCESS_SERVICE_URL: z.string().optional(),
    DOOR_SERVICE_URL: z.string().optional(),
    LOG_SERVICE_URL: z.string().optional(),
    CARD_SERVICE_URL: z.string().optional(),
  },
  /**
   * Specify your server-side environment variables schema here.
   * This way you can ensure the app isn't built with invalid env vars.
   */
  server: {
    //DATABASE_URL: z.string(),
  },

  /**
   * Specify your client-side environment variables schema here.
   * For them to be exposed to the client, prefix them with `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },
  /**
   * Destructure all variables from `process.env` to make sure they aren't tree-shaken away.
   */
  experimental__runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    USER_SERVICE_URL: process.env.USER_SERVICE_URL,
    ACCESS_SERVICE_URL: process.env.ACCESS_SERVICE_URL,
    DOOR_SERVICE_URL: process.env.DOOR_SERVICE_URL,
    LOG_SERVICE_URL: process.env.LOG_SERVICE_URL,
    CARD_SERVICE_URL: process.env.CARD_SERVICE_URL,
  },
  skipValidation:
    !!process.env.CI || process.env.npm_lifecycle_event === "lint",
});
