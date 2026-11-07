import type { PlayTile, Tile, Wind } from "./types";

export const WINDS: Wind[] = ["E", "S", "W", "N"];
export const DRAGONS = ["RD", "GD", "WD"] as const;
const SUITS = ["m", "s", "p"] as const;

/** Canonical ordering: characters, bamboo, dots, winds, dragons. */
export const ALL_PLAY_TILES = [
  ...SUITS.flatMap((s) => [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `${n}${s}`)),
  ...WINDS, ...DRAGONS,
] as PlayTile[];

export const isNumbered = (t: string) => /^[1-9][msp]$/.test(t);
export const isBonus = (t: string) => /^[FS][1-4]$/.test(t); // "S" alone is South wind
export const isHonor = (t: string) => (WINDS as string[]).includes(t) || (DRAGONS as readonly string[]).includes(t);
export const isValidTile = (t: string): t is Tile => isNumbered(t) || isHonor(t) || isBonus(t);
export const isPlayTile = (t: string): t is PlayTile => isNumbered(t) || isHonor(t);
export const rankOf = (t: string) => Number(t[0]);
export const suitOf = (t: string) => t[1];
export const isTerminal = (t: string) => isNumbered(t) && (rankOf(t) === 1 || rankOf(t) === 9);

export function countTiles(tiles: readonly string[]): Record<string, number> {
  const c: Record<string, number> = {};
  for (const t of tiles) c[t] = (c[t] ?? 0) + 1;
  return c;
}
