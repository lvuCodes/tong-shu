import { describe, expect, it } from "vitest";
import { coAuthoredAdded } from "./ai-attribution.mjs";

describe("coAuthoredAdded", () => {
  it("sums lines from Claude co-authored commits and skips excluded paths", () => {
    let seen;
    const run = (args) => {
      seen = args;
      return "10\t2\tsrc/a.ts\n5\t0\tpackage-lock.json\n-\t-\tlogo.png\n3\t1\tsrc/b.ts\n";
    };
    expect(coAuthoredAdded("/repo", "abc", ["package-lock.json"], run)).toBe(13);
    expect(seen).toContain("--grep=^Co-Authored-By: Claude");
    expect(seen).toContain("abc..HEAD");
  });
});
