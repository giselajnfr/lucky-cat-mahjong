/** One check per rule id. A check returns true/false, or a count (fan is multiplied by it). */
import { DRAGONS, WINDS, isHonor, isNumbered, isTerminal, suitOf } from "./tiles";
import type { ScoringContext } from "./types";

type Check = (c: ScoringContext) => boolean | number;
const std = (c: ScoringContext) => c.kind === "STANDARD";
const pungOf = (c: ScoringContext, t: string) => std(c) && c.sets.some((s) => s.type !== "CHOW" && s.tiles[0] === t);
const dragon = (t: string): Check => (c) => pungOf(c, t);
/** Flower/season N belongs to the Nth seat wind: 1=East 2=South 3=West 4=North. */
const seatNo = (c: ScoringContext) => WINDS.indexOf(c.seatWind) + 1;

export const PATTERN_CHECKS: Record<string, Check> = {
  "self-draw": (c) => c.method === "SELF_DRAW",
  "concealed-hand": (c) => c.sets.every((s) => !s.exposed),
  "dragon-pung-red": dragon("RD"), "dragon-pung-green": dragon("GD"), "dragon-pung-white": dragon("WD"),
  "seat-wind-pung": (c) => pungOf(c, c.seatWind),
  "round-wind-pung": (c) => pungOf(c, c.roundWind),
  "all-chows": (c) => std(c) && c.sets.every((s) => s.type === "CHOW") &&
    (!c.config.allChowsRequiresPlainPair || !(DRAGONS as readonly string[]).includes(c.pair[0]) && c.pair[0] !== c.seatWind && c.pair[0] !== c.roundWind),
  "all-pungs": (c) => std(c) && c.sets.every((s) => s.type !== "CHOW"),
  "half-flush": (c) => new Set(c.allTiles.filter(isNumbered).map(suitOf)).size === 1 && c.allTiles.some(isHonor),
  "mixed-one-suit": (c) => PATTERN_CHECKS["half-flush"](c),
  "full-flush": (c) => new Set(c.allTiles.filter(isNumbered).map(suitOf)).size === 1 && !c.allTiles.some(isHonor),
  "all-honors": (c) => c.allTiles.every(isHonor),
  "all-terminals": (c) => c.allTiles.every(isTerminal),
  "terminals-and-honors": (c) => c.allTiles.every((t) => isTerminal(t) || isHonor(t)),
  "flower-seat": (c) => c.flowers.filter((f) => f === `F${seatNo(c)}`).length,
  "season-seat": (c) => c.flowers.filter((f) => f === `S${seatNo(c)}`).length,
  "flowers-complete": (c) => ["F1", "F2", "F3", "F4"].every((f) => (c.flowers as string[]).includes(f)),
  "seasons-complete": (c) => ["S1", "S2", "S3", "S4"].every((f) => (c.flowers as string[]).includes(f)),
  "seven-pairs": (c) => c.kind === "SEVEN_PAIRS",
  "thirteen-orphans": (c) => c.kind === "THIRTEEN_ORPHANS",
};
