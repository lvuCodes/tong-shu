export const SYNONYMS: Readonly<Record<string, string>> = {
  馀事勿取: "余事勿取",
  启钻: "启攒",
  盖屋: "造屋",
  造畜稠: "造畜椆栖",
  安碓磑: "安碓硙",
  开厕: "作厕",
};

const EMPTY = "无";

export function normalizeTerms(terms: readonly string[]): string[] {
  return [...new Set(terms.map((t) => SYNONYMS[t] ?? t))].filter((t) => t !== EMPTY);
}
