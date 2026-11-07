import { describe, expect, it } from "vitest";
import { calculateScore, calculatePoints, calculateScoreDistribution, DEFAULT_GAME_CONFIG as CFG, FAN_TABLE } from "../index";
import { findDecompositions } from "../combinations";
import { parseTiles as T } from "../handParser";
import type { WinningHandInput } from "../types";

const hand = (tiles: string, o: Partial<WinningHandInput> = {}): WinningHandInput => ({
  concealedTiles: T(tiles), melds: [], winningTile: T(tiles)[0], flowers: [], winningMethod: "DISCARD",
  winnerSeatWind: "W", roundWind: "N", isDealer: false, gameConfig: CFG, ...o,
});
const ids = (r: ReturnType<typeof calculateScore>) => r.detectedFan.map((f) => f.id);

describe("validation", () => {
  it("accepts a standard hand", () => expect(calculateScore(hand("123m 456m 789m 222p E E")).valid).toBe(true));
  it("rejects a hand that cannot form 4 sets + pair", () =>
    expect(calculateScore(hand("123m 456m 789m 222p E S")).errors.join()).toContain("4 sets and 1 pair"));
  it("finds multiple decompositions", () =>
    expect(findDecompositions(T("111m 222m 333m 555s 7p 7p"), 4).length).toBeGreaterThanOrEqual(2));
  it("picks the best decomposition (all pungs over chows)", () =>
    expect(ids(calculateScore(hand("111m 222m 333m 555s 7p 7p")))).toContain("all-pungs"));
  it("treats a Kong as one set", () => {
    const r = calculateScore(hand("123m 456m 789p E E", { winningTile: "7p", melds: [{ type: "KONG", tiles: ["RD", "RD", "RD", "RD"], exposed: false }] }));
    expect(r.valid).toBe(true); expect(ids(r)).toContain("dragon-pung-red");
  });
  it("rejects 5 copies of a tile", () =>
    expect(calculateScore(hand("1m 1m 1m 1m 1m 2m 3m 4m 5m 6m 7m 8m 9m 9m")).errors.join()).toContain("Too many copies"));
  it("rejects a missing winning tile", () =>
    expect(calculateScore(hand("123m 456m 789m 222p E E", { winningTile: "5s" })).errors.join()).toContain("Winning tile is missing"));
  it("rejects a wrong tile count", () =>
    expect(calculateScore(hand("123m 456m 789m E E")).errors.join()).toContain("Invalid tile count"));
});

describe("fan detection", () => {
  it("self draw", () => expect(ids(calculateScore(hand("123m 456m 789m 222p E E", { winningMethod: "SELF_DRAW" })))).toContain("self-draw"));
  it("dragon pung", () => expect(ids(calculateScore(hand("RD RD RD 123m 456m 789p E E")))).toContain("dragon-pung-red"));
  it("seat wind", () => expect(ids(calculateScore(hand("E E E 123m 456m 789p 2s 2s", { winnerSeatWind: "E" })))).toContain("seat-wind-pung"));
  it("round wind", () => expect(ids(calculateScore(hand("S S S 123m 456m 789p 2s 2s", { roundWind: "S" })))).toContain("round-wind-pung"));
  it("all chows", () => expect(ids(calculateScore(hand("123m 456m 789m 234p 5p 5p")))).toContain("all-chows"));
  it("all pungs", () => expect(ids(calculateScore(hand("111m 999m 222p 555s 3p 3p")))).toContain("all-pungs"));
  it("half flush", () => expect(ids(calculateScore(hand("123m 456m 789m E E E 5m 5m")))).toContain("half-flush"));
  it("full flush excludes half flush", () => {
    const r = calculateScore(hand("123m 456m 789m 234m 5m 5m"), { debug: true });
    expect(ids(r)).toContain("full-flush"); expect(ids(r)).not.toContain("half-flush");
  });
  it("all honors", () => expect(ids(calculateScore(hand("E E E S S S RD RD RD GD GD GD WD WD")))).toContain("all-honors"));
  it("flowers match seat", () => {
    const r = calculateScore(hand("123m 456m 789m 222p E E", { winnerSeatWind: "E", flowers: ["F1", "S1", "F2"] }));
    expect(ids(r)).toEqual(expect.arrayContaining(["flower-seat", "season-seat"]));
  });
  it("complete flower set", () =>
    expect(ids(calculateScore(hand("123m 456m 789m 222p E E", { flowers: ["F1", "F2", "F3", "F4"] })))).toContain("flowers-complete"));
});

describe("cap, minimum, points", () => {
  it("caps fan", () => {
    const r = calculateScore(hand("111m 999m 222p 555s 3p 3p", { gameConfig: { ...CFG, maximumFan: 2 } }));
    expect(r.rawFan).toBeGreaterThan(2); expect(r.cappedFan).toBe(2);
  });
  it("enforces minimum fan", () => {
    const r = calculateScore(hand("123m 456m 789m 222p E E", { gameConfig: { ...CFG, minimumFan: 99 } }));
    expect(r.valid).toBe(false); expect(r.reason).toContain("minimum Fan"); expect(r.totalFan).toBe(0);
  });
  it("points match the table for every fan level", () => {
    for (const [fan, pts] of Object.entries(CFG.pointTable)) expect(calculatePoints(Number(fan), CFG.pointTable)).toBe(pts);
  });
  it("fan table has unique ids", () => expect(new Set(FAN_TABLE.map((r) => r.id)).size).toBe(FAN_TABLE.length));
});

describe("score distribution", () => {
  const p = { playerIds: ["a", "b", "c", "d"], dealerId: "a", basePoints: 400 };
  const cfg = { ...CFG, selfDrawRules: { dealerMultiplier: 2, nonDealerMultiplier: 1 }, discardRules: { dealerMultiplier: 2, paymentMode: "DISCARDER_PAYS_ALL" as const } };
  it("dealer self draw", () => expect(calculateScoreDistribution({ ...p, winnerId: "a", method: "SELF_DRAW", config: cfg }).winner.points).toBe(2400));
  it("non-dealer self draw", () => expect(calculateScoreDistribution({ ...p, winnerId: "b", method: "SELF_DRAW", config: cfg }).winner.points).toBe(1200));
  it("dealer discard win", () => {
    const d = calculateScoreDistribution({ ...p, winnerId: "a", discarderId: "c", method: "DISCARD", config: cfg });
    expect(d.winner.points).toBe(800); expect(d.payments.find((x) => x.playerId === "c")?.points).toBe(800);
  });
  it("non-dealer discard win, both payment modes", () => {
    expect(calculateScoreDistribution({ ...p, winnerId: "b", discarderId: "c", method: "DISCARD", config: cfg }).winner.points).toBe(400);
    const split = { ...cfg, discardRules: { dealerMultiplier: 1, paymentMode: "DISCARDER_FULL_OTHERS_HALF" as const } };
    expect(calculateScoreDistribution({ ...p, winnerId: "b", discarderId: "c", method: "DISCARD", config: split }).winner.points).toBe(800);
  });
});
