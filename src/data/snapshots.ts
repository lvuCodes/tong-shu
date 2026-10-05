export interface CcoDay {
  pillars: [string, string, string];
  clash?: string;
  sha?: string;
  yi?: string[];
  ji?: string[];
  good_hours?: string[];
  holiday?: string;
}

export interface CcoReliability {
  day_shift: number;
  month_branch: string;
  reliable: boolean;
}

export interface Manifest {
  captured: string;
  years: string[];
  cco_reliability: Record<string, CcoReliability>;
  wedding_sources: Record<string, string[]>;
}

export type Fetcher = (url: string) => Promise<Response>;

const cache = new Map<string, Promise<unknown>>();

export function dataUrl(name: string, base = import.meta.env.BASE_URL): string {
  return `${base}data/${name}`;
}

function load<T>(name: string, fetcher: Fetcher): Promise<T> {
  if (!cache.has(name))
    cache.set(
      name,
      fetcher(dataUrl(name)).then((r) => {
        if (!r.ok) throw new Error(`${name}: HTTP ${r.status}`);
        return r.json();
      }),
    );
  return cache.get(name) as Promise<T>;
}

export const loadManifest = (fetcher: Fetcher = fetch) => load<Manifest>("manifest.json", fetcher);

export async function loadCcoYear(
  year: number,
  fetcher: Fetcher = fetch,
): Promise<Record<string, CcoDay> | null> {
  const manifest = await loadManifest(fetcher);
  if (!manifest.years.includes(String(year))) return null;
  return load<Record<string, CcoDay>>(`cco-${year}.json`, fetcher);
}

export const loadWeddings = (fetcher: Fetcher = fetch) =>
  load<Record<string, string[]>>("weddings.json", fetcher);

export function clearSnapshotCache(): void {
  cache.clear();
}

export async function loadSnapshots(years: number[], fetcher: Fetcher = fetch) {
  const [manifest, weddings, ccoYears] = await Promise.all([
    loadManifest(fetcher),
    loadWeddings(fetcher),
    Promise.all(years.map((y) => loadCcoYear(y, fetcher))),
  ]);
  return {
    cco: Object.assign({}, ...ccoYears.filter(Boolean)) as Record<string, CcoDay>,
    reliability: manifest.cco_reliability,
    weddings,
  };
}
