import { calculateFan } from "./fanDetector";
import { buildContext } from "./handParser";
import { validateHand } from "./handValidator";
import { calculatePoints, calculateScoreDistribution } from "./pointCalculator";
import type { ScoringResult, WinningHandInput } from "./types";

export type ScoreOptions = {
  debug?: boolean;
  players?: { winnerId: string; discarderId?: string; dealerId: string; playerIds: string[] };
};

const empty = (errors: string[], reason?: string): ScoringResult =>
  ({ valid: false, errors, reason, detectedFan: [], rawFan: 0, cappedFan: 0, totalFan: 0, basePoints: 0, explanation: errors });

/** Single entry point for the UI: validate -> decompose -> detect fan -> exclusions -> cap -> points. */
export function calculateScore(input: WinningHandInput, opts: ScoreOptions = {}): ScoringResult {
  const cfg = input.gameConfig;
  const { errors, decompositions } = validateHand(input);
  if (errors.length) return empty(errors);

  // Score every decomposition; the best raw fan wins (ties keep the first found).
  const scored = decompositions.map((d) => ({ d, f: calculateFan(buildContext(input, d)) }));
  const best = scored.reduce((a, b) => (b.f.rawFan > a.f.rawFan ? b : a));

  if (best.f.rawFan < cfg.minimumFan) {
    const r = empty([], "Winning hand does not meet the minimum Fan requirement");
    r.handDecomposition = best.d; r.rawFan = best.f.rawFan;
    r.explanation = [`Raw fan ${best.f.rawFan} is below the minimum of ${cfg.minimumFan}`];
    return r;
  }

  const basePoints = calculatePoints(best.f.cappedFan, cfg.pointTable);
  const explanation = [
    ...best.f.detected.map((f) => `${f.name}: ${f.fan} fan`),
    `Raw fan ${best.f.rawFan}, cap ${cfg.maximumFan}, final fan ${best.f.cappedFan}`,
    `Base points: ${basePoints}`,
  ];
  const result: ScoringResult = {
    valid: true, errors: [], handDecomposition: best.d, detectedFan: best.f.detected,
    rawFan: best.f.rawFan, cappedFan: best.f.cappedFan, totalFan: best.f.cappedFan, basePoints, explanation,
  };
  if (opts.players) result.scoreDistribution = calculateScoreDistribution({ ...opts.players, method: input.winningMethod, basePoints, config: cfg });
  if (opts.debug) result.debug = { possibleDecompositions: decompositions, detectedRulesBeforeExclusions: best.f.before, excludedRules: best.f.excluded };
  return result;
}
