import type { HandDecomposition, ScoringContext, WinningHandInput } from "./types";

/** Build the context that fan rules inspect, for one candidate decomposition. */
export function buildContext(input: WinningHandInput, d: HandDecomposition): ScoringContext {
  return {
    kind: d.kind, sets: d.sets, pair: d.pair,
    allTiles: [...input.concealedTiles, ...input.melds.flatMap((m) => m.tiles)],
    flowers: input.flowers, method: input.winningMethod, seatWind: input.winnerSeatWind,
    roundWind: input.roundWind, isDealer: input.isDealer, winningTile: input.winningTile, config: input.gameConfig,
  };
}

/** Test helper: "123m 456s E E RD" -> tiles. Numbered groups expand; other tokens pass through. */
export function parseTiles(s: string) {
  return s.trim().split(/\s+/).flatMap((tok) => /^\d+[msp]$/.test(tok) ? [...tok.slice(0, -1)].map((n) => `${n}${tok.slice(-1)}`) : [tok]) as never[];
}
