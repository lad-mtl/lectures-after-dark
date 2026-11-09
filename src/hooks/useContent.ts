import { useEffect, useState } from "react";
import { refreshEventDates } from "../lib/eventDates.ts";
import type { PublicEvent } from "../types/content";

type Resource = "events" | "speakers" | "topics" | "team-members";
interface ContentState<T> {
  data: T[];
  loading: boolean;
  error: boolean;
  stale: boolean;
  fetchedAt: string | null;
}
const pending = <T,>(): ContentState<T> => ({ data: [], loading: true, error: false, stale: false, fetchedAt: null });

async function fetchContent<T>(resource: Resource, signal?: AbortSignal) {
  const response = await fetch(`/api/content/${resource}`, { signal });
  if (!response.ok) throw new Error("Content is temporarily unavailable.");
  const data: unknown = await response.json();
  if (!Array.isArray(data)) throw new Error("Invalid content response.");
  return {
    data: (resource === "events" ? refreshEventDates(data) : data) as T[],
    stale: response.headers.get("x-content-source") === "stale-cache",
    fetchedAt: response.headers.get("x-content-fetched-at"),
  };
}

export async function fetchEvents(signal?: AbortSignal) {
  const { data, ...metadata } = await fetchContent<PublicEvent>("events", signal);
  return { events: data, ...metadata };
}

export function useContent<T>(resource: Resource): ContentState<T> {
  const [state, setState] = useState<ContentState<T> & { resource: Resource }>(() => ({ ...pending<T>(), resource }));
  useEffect(() => {
    const controller = new AbortController();
    // Resource-keyed state prevents old data or errors appearing during navigation.
    fetchContent<T>(resource, controller.signal).then(result => {
      if (!controller.signal.aborted) setState({ ...result, resource, loading: false, error: false });
    }).catch(() => {
      if (!controller.signal.aborted) setState({ ...pending<T>(), resource, loading: false, error: true });
    });
    return () => controller.abort();
  }, [resource]);
  if (state.resource !== resource) {
    setState({ ...pending<T>(), resource });
    return pending<T>();
  }
  const { data, loading, error, stale, fetchedAt } = state;
  return { data, loading, error, stale, fetchedAt };
}

export function useEvents() {
  const { data: events, ...state } = useContent<PublicEvent>("events");
  return { events, ...state };
}
