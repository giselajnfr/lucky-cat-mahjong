import { FAN_TABLE } from "./hk18Rules";
import { PATTERN_CHECKS } from "./hk18Patterns";
import type { DetectedFan, ScoringContext } from "./types";

const FLOWER_IDS = ["flower-seat", "season-seat", "flowers-complete", "seasons-complete"];

/** Detect all enabled rules, then remove any rule excluded by a detected rule. */
export function detectFan(ctx: ScoringContext) {
  const table = (ctx.config.fanTable ?? FAN_TABLE).filter((r) => r.enabled && (ctx.config.enableFlowers || !FLOWER_IDS.includes(r.id)));
  const hits: { id: string; name: string; fan: number; excludes: string[] }[] = [];
  for (const r of table) {
    const res = PATTERN_CHECKS[r.id]?.(ctx);
    const n = res === true ? 1 : res === false || res === undefined ? 0 : res;
    if (n > 0) hits.push({ id: r.id, name: r.name, fan: r.fan * n, excludes: r.excludes ?? [] });
  }
  const excluded = new Set(hits.flatMap((h) => h.excludes));
  const detected: DetectedFan[] = hits.filter((h) => !excluded.has(h.id)).map(({ id, name, fan }) => ({ id, name, fan }));
  return {
    detected,
    before: hits.map((h) => h.id),
    excluded: hits.filter((h) => excluded.has(h.id)).map((h) => h.id),
  };
}

export function calculateFan(ctx: ScoringContext) {
  const d = detectFan(ctx);
  const rawFan = d.detected.reduce((s, f) => s + f.fan, 0);
  return { ...d, rawFan, cappedFan: Math.min(rawFan, ctx.config.maximumFan) };
}
