// Tong Shu. Copyright (C) 2026 lvuCodes. Licensed under GPL-3.0-or-later; see LICENSE.

export const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";

export interface PlaceHit {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  country_code?: string;
  country?: string;
  admin1?: string;
  admin2?: string;
}

export interface ResolvedPlace {
  place: string;
  tz: string;
  lon: number;
  country: string;
}

export function placeLabel(h: PlaceHit): string {
  const parts = [h.name, h.admin1, h.country].filter((p): p is string => Boolean(p));
  return [...new Set(parts)].join(", ");
}

export function resolvePlace(h: PlaceHit): ResolvedPlace {
  return {
    place: placeLabel(h),
    tz: h.timezone ?? "UTC",
    lon: h.longitude,
    country: h.country_code ?? "",
  };
}

function matches(h: PlaceHit, qualifiers: string[]): boolean {
  const fields = [h.admin1, h.admin2, h.country, h.country_code]
    .filter((f): f is string => Boolean(f))
    .map((f) => f.toLowerCase());
  return qualifiers.every((q) => fields.some((f) => f.includes(q.toLowerCase())));
}

export async function searchPlaces(
  query: string,
  fetcher: typeof fetch = fetch,
): Promise<PlaceHit[]> {
  const [name, ...qualifiers] = query
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!name || name.length < 2) return [];
  const url = `${GEOCODE_URL}?name=${encodeURIComponent(name)}&count=10&language=en&format=json`;
  const res = await fetcher(url);
  if (!res.ok) throw new Error(`Place lookup failed with status ${res.status}`);
  const body = (await res.json()) as { results?: PlaceHit[] };
  return (body.results ?? []).filter((h) => h.timezone && matches(h, qualifiers));
}
