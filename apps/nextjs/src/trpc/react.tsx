"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { loggerLink, unstable_httpBatchStreamLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import SuperJSON from "superjson";

import type { AppRouter as AccessAppRouter } from "@dumbledoor/access-api";
import type { AppRouter as UserAppRouter } from "@dumbledoor/user-api";

import { env } from "~/env";

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 30 * 1000,
      },
    },
  });

let clientQueryClientSingleton: QueryClient | undefined = undefined;

const getQueryClient = () => {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return createQueryClient();
  } else {
    // Browser: use singleton pattern to keep the same query client
    return (clientQueryClientSingleton ??= createQueryClient());
  }
};

export const trpc = {
  user: createTRPCReact<UserAppRouter>(),
  access: createTRPCReact<AccessAppRouter>(),
};

export function AccessTRPCReactProvider(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  const [accessTrpcClient] = useState(() =>
    trpc.access.createClient({
      links: [
        loggerLink({
          enabled: (op) =>
            env.NODE_ENV === "development" ||
            (op.direction === "down" && op.result instanceof Error),
        }),
        unstable_httpBatchStreamLink({
          transformer: SuperJSON,
          url: getAccessBaseUrl() + "/api/trpc",
          headers() {
            console.log("accessTrpcClient headers");
            const headers = new Headers();
            headers.set("x-trpc-source", "nextjs-react");
            const savedToken = localStorage.getItem("token");
            if (savedToken) {
              headers.set(
                "authorization",
                `Bearer ${localStorage.getItem("token")}`,
              );
            }
            return headers;
          },
        }),
      ],
    }),
  );

  return (
    <trpc.access.Provider client={accessTrpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </trpc.access.Provider>
  );
}

export function UserTRPCReactProvider(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  const [userTrpcClient] = useState(() =>
    trpc.user.createClient({
      links: [
        loggerLink({
          enabled: (op) =>
            env.NODE_ENV === "development" ||
            (op.direction === "down" && op.result instanceof Error),
        }),
        unstable_httpBatchStreamLink({
          transformer: SuperJSON,
          url: getUserBaseUrl() + "/api/trpc",
          headers() {
            console.log("accessTrpcClient headers");
            const headers = new Headers();
            headers.set("x-trpc-source", "nextjs-react");
            const savedToken = localStorage.getItem("token");
            if (savedToken) {
              headers.set(
                "authorization",
                `Bearer ${localStorage.getItem("token")}`,
              );
            }
            return headers;
          },
        }),
      ],
    }),
  );

  return (
    <trpc.user.Provider client={userTrpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </trpc.user.Provider>
  );
}

export function TRPCReactProvider(props: { children: React.ReactNode }) {
  // const queryClient = getQueryClient();

  // const [accessTrpcClient] = useState(() =>
  //   trpc.access.createClient({
  //     links: [
  //       loggerLink({
  //         enabled: (op) =>
  //           env.NODE_ENV === "development" ||
  //           (op.direction === "down" && op.result instanceof Error),
  //       }),
  //       unstable_httpBatchStreamLink({
  //         transformer: SuperJSON,
  //         url: getAccessBaseUrl() + "/api/trpc",
  //         headers() {
  //           console.log("accessTrpcClient headers");
  //           const headers = new Headers();
  //           headers.set("x-trpc-source", "nextjs-react");
  //           const savedToken = localStorage.getItem("token");
  //           if (savedToken) {
  //             headers.set(
  //               "authorization",
  //               `Bearer ${localStorage.getItem("token")}`,
  //             );
  //           }
  //           return headers;
  //         },
  //       }),
  //     ],
  //   }),
  // );

  // const [userTrpcClient] = useState(() =>
  //   trpc.user.createClient({
  //     links: [
  //       loggerLink({
  //         enabled: (op) =>
  //           env.NODE_ENV === "development" ||
  //           (op.direction === "down" && op.result instanceof Error),
  //       }),
  //       unstable_httpBatchStreamLink({
  //         transformer: SuperJSON,
  //         url: getUserBaseUrl() + "/api/trpc",
  //         headers() {
  //           console.log("userTrpcClient headers");
  //           const headers = new Headers();
  //           headers.set("x-trpc-source", "nextjs-react");
  //           const savedToken = localStorage.getItem("token");
  //           if (savedToken) {
  //             headers.set(
  //               "authorization",
  //               `Bearer ${localStorage.getItem("token")}`,
  //             );
  //           }
  //           return headers;
  //         },
  //       }),
  //     ],
  //   }),
  // );

  return <>{props.children}</>;
}

const getUserBaseUrl = () => {
  return `http://localhost:4000`;
};

const getAccessBaseUrl = () => {
  return `http://localhost:4001`;
};

const _getBaseUrl = () => {
  if (typeof window !== "undefined") return window.location.origin;
  if (env.VERCEL_URL) return `https://${env.VERCEL_URL}`;
  // eslint-disable-next-line no-restricted-properties
  return `http://localhost:${process.env.PORT ?? 3000}`;
};
