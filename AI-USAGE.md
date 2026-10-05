# AI Usage

**47.9% AI, 52.1% human**, by lines added since the baseline commit.

| Measure | Lines added |
|---|---|
| **By Claude** | 5,040 |
| **By the author** | 5,478 |
| **Total since baseline** | 10,518 |

Baseline commit `a09c643` (2026-10-02). Regenerate with `node scripts/ai-attribution.mjs`.

## Measurement Scope

- The figures count **lines added since the baseline commit**, not lines currently surviving in the working tree. A line written once and rewritten twice is counted three times.
- Everything committed **before the baseline** is unattributed and appears in no column. Authorship there cannot be honestly reconstructed, so it is not guessed at.
- The ledger records only edits made through **Claude Code's own editing tools**. Anything typed by hand, produced by editor autocomplete, or written by another assistant counts as the author's.
- A line count is **not a claim about authorship of design or direction**. What to build, which generated output to keep, and what to reject are the author's, and none of it appears in a diff.
- Figures are computed from `.ai-attribution/ledger.jsonl` — an append-only record written as each edit lands — joined against `git log --numstat`. The ledger is committed as the evidence behind this report.

## Excluded Paths

- `package-lock.json`
- `pnpm-lock.yaml`
- `yarn.lock`
- `dist/**`
- `build/**`
- `vendor/**`
- `**/*.min.*`
- `AI-USAGE.md`
- `.ai-attribution/**`
- `public/data/**`
- `src/engine/fixtures/**`
- `local/**`
- `pipeline/data/**`

_Generated 2026-10-05 22:15:56Z.
