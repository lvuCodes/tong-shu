import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearSnapshotCache, dataUrl, loadCcoYear, loadManifest } from "./snapshots";

const manifest = {
  captured: "2026-10-02",
  years: ["2026"],
  cco_reliability: {},
  wedding_sources: {},
};

function fakeFetch(files: Record<string, unknown>) {
  return vi.fn(async (url: string) => {
    const name = url.split("/").pop()!;
    return name in files
      ? new Response(JSON.stringify(files[name]))
      : new Response("missing", { status: 404 });
  });
}

beforeEach(clearSnapshotCache);

describe("snapshots", () => {
  it("resolves data files under the site base path", () => {
    expect(dataUrl("manifest.json", "/tong-shu/")).toBe("/tong-shu/data/manifest.json");
  });

  it("fetches the manifest once and reuses it", async () => {
    const fetcher = fakeFetch({ "manifest.json": manifest });
    await loadManifest(fetcher);
    await loadManifest(fetcher);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("returns null for a year with no snapshot", async () => {
    const fetcher = fakeFetch({ "manifest.json": manifest });
    expect(await loadCcoYear(2040, fetcher)).toBeNull();
  });

  it("loads a covered year", async () => {
    const day = { pillars: ["丙午", "丁酉", "戊申"] };
    const fetcher = fakeFetch({
      "manifest.json": manifest,
      "cco-2026.json": { "2026-10-01": day },
    });
    expect((await loadCcoYear(2026, fetcher))?.["2026-10-01"]).toEqual(day);
  });

  it("rejects when a file is missing", async () => {
    const fetcher = fakeFetch({});
    await expect(loadManifest(fetcher)).rejects.toThrow("HTTP 404");
  });
});
