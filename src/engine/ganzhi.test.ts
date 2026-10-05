import { describe, expect, it } from "vitest";
import { ganzhiEn, ganzhiPinyin } from "./dictionary";

describe("ganzhi labels", () => {
  it("gives tone-marked pinyin and the English meaning on separate lines", () => {
    expect(ganzhiPinyin("癸未")).toBe("Guǐ Wèi");
    expect(ganzhiEn("癸未")).toBe("Yin Water Goat");
    expect(ganzhiPinyin("子")).toBe("Zǐ");
    expect(ganzhiEn("子")).toBe("Rat");
  });
});
