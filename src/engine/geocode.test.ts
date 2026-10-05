import { describe, expect, it } from "vitest";
import { GEOCODE_URL, placeLabel, resolvePlace, searchPlaces, type PlaceHit } from "./geocode";

const SAPPORO: PlaceHit = {
  id: 2128295,
  name: "Sapporo",
  latitude: 43.06667,
  longitude: 141.35,
  timezone: "Asia/Tokyo",
  country_code: "JP",
  country: "Japan",
  admin1: "Hokkaido",
};
const SAPPORO_US: PlaceHit = {
  ...SAPPORO,
  id: 1,
  timezone: "America/Chicago",
  country_code: "US",
  country: "United States",
  admin1: "Texas",
};

function fakeFetch(results: PlaceHit[] | undefined, ok = true) {
  const urls: string[] = [];
  const fetcher = (async (url: string) => {
    urls.push(url);
    return { ok, status: ok ? 200 : 503, json: async () => ({ results }) };
  }) as unknown as typeof fetch;
  return { fetcher, urls };
}

describe("placeLabel and resolvePlace", () => {
  it("joins name, region and country without repeats", () => {
    expect(placeLabel(SAPPORO)).toBe("Sapporo, Hokkaido, Japan");
    expect(placeLabel({ ...SAPPORO, name: "Tokyo", admin1: "Tokyo" })).toBe("Tokyo, Japan");
  });

  it("maps a hit to the time zone, longitude and holiday country", () => {
    expect(resolvePlace(SAPPORO)).toEqual({
      place: "Sapporo, Hokkaido, Japan",
      tz: "Asia/Tokyo",
      lon: 141.35,
      country: "JP",
    });
  });
});

describe("searchPlaces", () => {
  it("queries by the first comma part and filters by the rest", async () => {
    const { fetcher, urls } = fakeFetch([SAPPORO, SAPPORO_US]);
    const hits = await searchPlaces("Sapporo, Texas", fetcher);
    expect(urls[0]).toBe(`${GEOCODE_URL}?name=Sapporo&count=10&language=en&format=json`);
    expect(hits.map((h) => h.id)).toEqual([1]);
  });

  it("skips short queries, hits without a time zone and empty results", async () => {
    const { fetcher, urls } = fakeFetch(undefined);
    expect(await searchPlaces("S", fetcher)).toEqual([]);
    expect(urls).toEqual([]);
    expect(await searchPlaces("Nowhere", fetcher)).toEqual([]);
    const noTz = fakeFetch([{ ...SAPPORO, timezone: undefined }]);
    expect(await searchPlaces("Sapporo", noTz.fetcher)).toEqual([]);
  });

  it("rejects when the lookup service fails", async () => {
    await expect(searchPlaces("Sapporo", fakeFetch([], false).fetcher)).rejects.toThrow("503");
  });
});
