"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";

import type { PublicConfig, User } from "@/lib/api/schemas";
import { configQueryKey, meQueryKey } from "./keys";

const isServer = typeof window === "undefined";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
}

let browserClient: QueryClient | undefined;

function getQueryClient(): QueryClient {
  if (isServer) return makeQueryClient();
  if (!browserClient) browserClient = makeQueryClient();
  return browserClient;
}

export function QueryProvider({
  children,
  initialConfig,
  initialMe,
}: {
  children: ReactNode;
  initialConfig: PublicConfig;
  initialMe: User | null;
}) {
  const [client] = useState(() => {
    const qc = getQueryClient();
    qc.setQueryData(configQueryKey, initialConfig);
    qc.setQueryData(meQueryKey, initialMe);
    return qc;
  });
  return (
    <QueryClientProvider client={client}>
      {children}
      {process.env.NODE_ENV === "development" ? (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      ) : null}
    </QueryClientProvider>
  );
}
