"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { loggerLink, unstable_httpBatchStreamLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import SuperJSON from "superjson";

import type { AppRouter as AccessAppRouter } from "@dumbledoor/access-api";
import type { AppRouter as CardAppRouter } from "@dumbledoor/card-api";
import type { AppRouter as DoorAppRouter } from "@dumbledoor/door-api";
import type { AppRouter as LogAppRouter } from "@dumbledoor/log-api";
import type { AppRouter as UserAppRouter } from "@dumbledoor/user-api";
import type { AppRouter as AlarmAppRouter } from "@dumbledoor/alarm-api";

import { env } from "~/env";
import {
  getAccessBaseUrl,
  getCardBaseUrl,
  getDoorBaseUrl,
  getLogBaseUrl,
  getUserBaseUrl,
  getAlarmBaseUrl
} from "~/trpc/getUrls";

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
  door: createTRPCReact<DoorAppRouter>(),
  log: createTRPCReact<LogAppRouter>(),
  card: createTRPCReact<CardAppRouter>(),
  alarm: createTRPCReact<AlarmAppRouter>(),
};

export function UserTRPCReactProvider(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const [urls, setUrls] = useState<string | null>(null);

  const [userTrpcClient, setUserTrpcClient] = useState<ReturnType<
    typeof trpc.user.createClient
  > | null>(null);

  useEffect(() => {
    async function fetchUrls() {
      setUrls(await getUserBaseUrl());
    }
    void fetchUrls();
  }, []);

  useEffect(() => {
    const updateUserTrpcClient = () => {
      if (urls) {
        const newClient = trpc.user.createClient({
          links: [
            loggerLink({
              enabled: (op) =>
                env.NODE_ENV === "development" ||
                (op.direction === "down" && op.result instanceof Error),
            }),
            unstable_httpBatchStreamLink({
              transformer: SuperJSON,
              url: urls + "/api/trpc",
              headers() {
                console.log("userTrpcClient headers");
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
        });
        setUserTrpcClient(newClient);
      } else {
        setUserTrpcClient(null);
      }
    };

    updateUserTrpcClient();
  }, [urls]);

  console.log("userTrpcClient", userTrpcClient);
  if (!urls || !userTrpcClient) return null;

  return (
    <trpc.user.Provider client={userTrpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </trpc.user.Provider>
  );
}

export function AccessTRPCReactProvider(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const [urls, setUrls] = useState<string | null>(null);

  const [accessTrpcClient, setAccessTrpcClient] = useState<ReturnType<
    typeof trpc.access.createClient
  > | null>(null);

  useEffect(() => {
    async function fetchUrls() {
      setUrls(await getAccessBaseUrl());
    }
    void fetchUrls();
  }, []);

  useEffect(() => {
    const updateAccessTrpcClient = () => {
      if (urls) {
        const newClient = trpc.access.createClient({
          links: [
            loggerLink({
              enabled: (op) =>
                env.NODE_ENV === "development" ||
                (op.direction === "down" && op.result instanceof Error),
            }),
            unstable_httpBatchStreamLink({
              transformer: SuperJSON,
              url: urls + "/api/trpc",
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
        });
        setAccessTrpcClient(newClient);
      } else {
        setAccessTrpcClient(null);
      }
    };

    updateAccessTrpcClient();
  }, [urls]);

  console.log("accessTrpcClient", accessTrpcClient);
  if (!urls || !accessTrpcClient) return null;

  return (
    <trpc.access.Provider client={accessTrpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </trpc.access.Provider>
  );
}

export function DoorTRPCReactProvider(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const [urls, setUrls] = useState<string | null>(null);

  const [doorTrpcClient, setDoorTrpcClient] = useState<ReturnType<
    typeof trpc.door.createClient
  > | null>(null);

  useEffect(() => {
    async function fetchUrls() {
      setUrls(await getDoorBaseUrl());
    }
    void fetchUrls();
  }, []);

  useEffect(() => {
    const updateDoorTrpcClient = () => {
      if (urls) {
        const newClient = trpc.door.createClient({
          links: [
            loggerLink({
              enabled: (op) =>
                env.NODE_ENV === "development" ||
                (op.direction === "down" && op.result instanceof Error),
            }),
            unstable_httpBatchStreamLink({
              transformer: SuperJSON,
              url: urls + "/api/trpc",
              headers() {
                console.log("doorTrpcClient headers");
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
        });
        setDoorTrpcClient(newClient);
      } else {
        setDoorTrpcClient(null);
      }
    };

    updateDoorTrpcClient();
  }, [urls]);

  if (!urls || !doorTrpcClient) return null;

  return (
    <trpc.door.Provider client={doorTrpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </trpc.door.Provider>
  );
}

export function AlarmTRPCReactProvider(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const [urls, setUrls] = useState<string | null>(null);

  const [alarmTrpcClient, setAlarmTrpcClient] = useState<ReturnType<
    typeof trpc.alarm.createClient
  > | null>(null);

  useEffect(() => {
    async function fetchUrls() {
      setUrls(await getAlarmBaseUrl());
    }
    void fetchUrls();
  }, []);

  useEffect(() => {
    const updateAlarmTrpcClient = () => {
      if (urls) {
        const newClient = trpc.alarm.createClient({
          links: [
            loggerLink({
              enabled: (op) =>
                env.NODE_ENV === "development" ||
                (op.direction === "down" && op.result instanceof Error),
            }),
            unstable_httpBatchStreamLink({
              transformer: SuperJSON,
              url: urls + "/api/trpc",
              headers() {
                console.log("alarmTrpcClient headers");
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
        });
        setAlarmTrpcClient(newClient);
      } else {
        setAlarmTrpcClient(null);
      }
    };

    updateAlarmTrpcClient();
  }, [urls]);

  if (!urls || !alarmTrpcClient) return null;

  return (
    <trpc.alarm.Provider client={alarmTrpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </trpc.alarm.Provider>
  );
}

export function LogTRPCReactProvider(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const [urls, setUrls] = useState<string | null>(null);

  const [logTrpcClient, setLogTrpcClient] = useState<ReturnType<
    typeof trpc.log.createClient
  > | null>(null);

  useEffect(() => {
    async function fetchUrls() {
      setUrls(await getLogBaseUrl());
    }
    void fetchUrls();
  }, []);

  useEffect(() => {
    const updateLogTrpcClient = () => {
      if (urls) {
        const newClient = trpc.log.createClient({
          links: [
            loggerLink({
              enabled: (op) =>
                env.NODE_ENV === "development" ||
                (op.direction === "down" && op.result instanceof Error),
            }),
            unstable_httpBatchStreamLink({
              transformer: SuperJSON,
              url: urls + "/api/trpc",
              headers() {
                console.log("logTrpcClient headers");
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
        });
        setLogTrpcClient(newClient);
      } else {
        setLogTrpcClient(null);
      }
    };

    updateLogTrpcClient();
  }, [urls]);

  console.log("logTrpcClient", logTrpcClient);
  if (!urls || !logTrpcClient) return null;

  return (
    <trpc.log.Provider client={logTrpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </trpc.log.Provider>
  );
}

export function CardTRPCReactProvider(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const [urls, setUrls] = useState<string | null>(null);

  const [cardTrpcClient, setCardTrpcClient] = useState<ReturnType<
    typeof trpc.card.createClient
  > | null>(null);

  useEffect(() => {
    async function fetchUrls() {
      setUrls(await getCardBaseUrl());
    }
    void fetchUrls();
  }, []);

  useEffect(() => {
    const updateCardTrpcClient = () => {
      if (urls) {
        const newClient = trpc.card.createClient({
          links: [
            loggerLink({
              enabled: (op) =>
                env.NODE_ENV === "development" ||
                (op.direction === "down" && op.result instanceof Error),
            }),
            unstable_httpBatchStreamLink({
              transformer: SuperJSON,
              url: urls + "/api/trpc",
              headers() {
                console.log("cardTrpcClient headers");
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
        });
        setCardTrpcClient(newClient);
      } else {
        setCardTrpcClient(null);
      }
    };

    updateCardTrpcClient();
  }, [urls]);

  console.log("cardTrpcClient", cardTrpcClient);
  if (!urls || !cardTrpcClient) return null;

  return (
    <trpc.card.Provider client={cardTrpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </trpc.card.Provider>
  );
}

export function TRPCReactProvider(props: { children: React.ReactNode }) {
  return <>{props.children}</>;
}
