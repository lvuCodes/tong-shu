import { describe, expect, it } from "vitest";
import { LunarUtil } from "lunar-javascript";
import { ACTIVITIES, en } from "./dictionary";
import { normalizeTerms } from "./terms";

describe("activity glossary", () => {
  it("translates every 宜 and 忌 term the almanac library can produce", () => {
    const terms = normalizeTerms(LunarUtil.YI_JI);
    expect(terms.filter((t) => !(ACTIVITIES[t] ?? en(t)))).toEqual([]);
  });
});
