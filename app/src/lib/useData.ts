import { useEffect, useState } from "react";
const cache = new Map<string, unknown>();
const inflight = new Map<string, Promise<unknown>>();
function load<T>(path: string): Promise<T> {
  if (cache.has(path)) return Promise.resolve(cache.get(path) as T);
  if (inflight.has(path)) return inflight.get(path) as Promise<T>;
  const p = fetch(`${import.meta.env.BASE_URL}data/${path}`)
    .then(r => { if (!r.ok) throw new Error(`Podaci se nisu mogli učitati (${r.status}).`); return r.json(); })
    .then(data => { cache.set(path, data); return data as T; })
    .finally(() => inflight.delete(path));
  inflight.set(path, p);
  return p;
}
export function useData<T>(path: string): { data: T | null; loading: boolean; error: string | null } {
  const [result, setResult] = useState<{ path: string; data?: T; error?: string }>({path});
  useEffect(() => {
    let cancelled = false;
    load<T>(path).then(data => { if (!cancelled) setResult({path, data}); })
      .catch(e => { if (!cancelled) setResult({path, error: String(e)}); });
    return () => { cancelled = true; };
  }, [path]);
  const current = result.path === path ? result : {path};
  if (current.error) throw new Error(current.error);
  const data = (cache.get(path) as T | undefined) ?? current.data ?? null;
  return { data, loading: data === null, error: null };
}
export function preload(path: string) { return load(path); }
