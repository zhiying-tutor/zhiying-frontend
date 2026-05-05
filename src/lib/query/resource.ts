"use client";

import { useQuery } from "@tanstack/react-query";

import { getJson } from "./utils";

type ResourceStatus = "QUEUING" | "GENERATING" | "FINISHED" | "FAILED";

export type ResourceKind =
  | "knowledge-videos"
  | "interactive-htmls"
  | "knowledge-explanations";

export function useResource<T extends { status: ResourceStatus }>(opts: {
  kind: ResourceKind;
  id: number;
  schema: { parse: (v: unknown) => T };
}) {
  return useQuery({
    queryKey: [opts.kind, opts.id] as const,
    queryFn: async () =>
      opts.schema.parse(await getJson(`/api/${opts.kind}/${opts.id}`)),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "FINISHED" || status === "FAILED") return false;
      return 2000;
    },
    staleTime: 0,
  });
}
