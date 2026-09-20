import type { AxiosInstance } from "axios";
import { useEffect, useState } from "react";
import { useFormApi } from "./FormApiContext";

/**
 * Managed reference vocabularies for the employee record — title,
 * marital status, diversity monitoring, etc. — fetched from the
 * backend's enumerations picker instead of hardcoded per-panel maps.
 *
 * The endpoint returns every enumeration in one payload:
 *   { data: { "employee.title": [{ code, label }, ...], ... } }
 * which we reshape to a `{ code: label }` map per enumeration so it
 * drops straight into the existing `dropdownContent(map)` /
 * `map[value]` consumption in the panels.
 *
 * Bureau and public hit different routes (the data is non-tenant but
 * the auth prefix differs), so callers pass their app's URL.
 */

export type EnumerationMap = Record<string, string>;
export type EnumerationMaps = Record<string, EnumerationMap>;

type ApiRow = { code: string; label: string };
type ApiPayload = { data?: Record<string, ApiRow[]> };

// Shared in-flight/resolved fetch per URL so the several panels on an
// employee record don't each fire their own request. A rejected
// fetch removes itself so a later mount can retry.
const inflight = new Map<string, Promise<EnumerationMaps>>();

function reshape(payload: ApiPayload): EnumerationMaps {
  const maps: EnumerationMaps = {};
  for (const [enumeration, rows] of Object.entries(payload.data ?? {})) {
    const map: EnumerationMap = {};
    for (const row of rows) {
      map[row.code] = row.label;
    }
    maps[enumeration] = map;
  }
  return maps;
}

/**
 * Drop the in-memory enumeration fetch cache so the next mount
 * refetches. Call after a Settings edit to the reference catalogue
 * (alongside busting the axios `/pickers/` cache) so open panels pick
 * up new / relabelled values without a full page reload.
 */
export function clearEnumerationsCache(): void {
  inflight.clear();
}

function load(api: AxiosInstance, url: string): Promise<EnumerationMaps> {
  let promise = inflight.get(url);
  if (!promise) {
    promise = api
      .get(url)
      .then((r) => reshape(r.data as ApiPayload))
      .catch((e) => {
        inflight.delete(url);
        throw e;
      });
    inflight.set(url, promise);
  }
  return promise;
}

export function useEnumerations(url: string): {
  maps: EnumerationMaps;
  loading: boolean;
} {
  const api = useFormApi();
  const [maps, setMaps] = useState<EnumerationMaps>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    load(api, url)
      .then((m) => {
        if (!cancelled) {
          setMaps(m);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [api, url]);

  return { maps, loading };
}
