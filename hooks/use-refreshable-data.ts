"use client";

import { useCallback, useEffect, useState } from "react";

export const REFRESH_EVENT = "biocatch-sdk-foundry:refresh" as const;

export function dispatchRefresh(): void {
  window.dispatchEvent(new CustomEvent(REFRESH_EVENT));
}

export function useRefreshableData<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const handler = () => load();
    window.addEventListener(REFRESH_EVENT, handler);
    return () => window.removeEventListener(REFRESH_EVENT, handler);
  }, [load]);

  return { data, loading, error, refresh: load };
}
