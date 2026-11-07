import type { GameConfig, ScoreDistribution } from "./types";

/** Capped fan -> base points. Fan between table keys uses the highest key not above it. */
export function calculatePoints(cappedFan: number, table: Record<number, number>): number {
  if (cappedFan <= 0) return 0;
  const key = Object.keys(table).map(Number).filter((k) => k <= cappedFan).sort((a, b) => b - a)[0];
  return key === undefined ? 0 : table[key];
}

export function calculateScoreDistribution(p: {
  winnerId: string; discarderId?: string; dealerId: string; playerIds: string[];
  method: "SELF_DRAW" | "DISCARD"; basePoints: number; config: GameConfig;
}): ScoreDistribution {
  const { winnerId, discarderId, dealerId, playerIds, method, basePoints, config } = p;
  const losers = playerIds.filter((id) => id !== winnerId);
  const winnerIsDealer = winnerId === dealerId;
  let payments: { playerId: string; points: number }[];

  if (method === "SELF_DRAW") {
    const m = winnerIsDealer ? config.selfDrawRules.dealerMultiplier : config.selfDrawRules.nonDealerMultiplier;
    payments = losers.map((id) => ({ playerId: id, points: Math.round(basePoints * m) }));
  } else {
    if (!discarderId || !losers.includes(discarderId)) throw new Error("Discard win needs a discarder who is not the winner");
    const amount = Math.round(basePoints * (winnerIsDealer ? config.discardRules.dealerMultiplier : 1));
    const others = config.discardRules.paymentMode === "DISCARDER_FULL_OTHERS_HALF" ? Math.round(amount / 2) : 0;
    payments = losers.map((id) => ({ playerId: id, points: id === discarderId ? amount : others }));
  }
  return { winner: { playerId: winnerId, points: payments.reduce((s, x) => s + x.points, 0) }, payments };
}
