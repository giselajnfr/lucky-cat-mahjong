/**
 * HK18 rule configuration — THE FILE TO EDIT for house rules.
 * !! Every fan and point value below is a PLACEHOLDER pending house-rule review. !!
 */
import type { FanRuleConfig, GameConfig } from "./types";

export const HK18_RULES = {
  minimumFan: 1,
  maximumFan: 10,
  enableFlowers: true,
  specialHands: { sevenPairs: false, thirteenOrphans: false },
  allChowsRequiresPlainPair: true,
  drawKeepsDealer: true, // read by the game engine: an exhaustive draw does not rotate the dealer
};

export const FAN_TABLE: FanRuleConfig[] = [
  { id: "self-draw", name: "Self Draw", fan: 1, enabled: true },
  { id: "concealed-hand", name: "Concealed Hand", fan: 1, enabled: true, description: "No exposed melds" },
  { id: "dragon-pung-red", name: "Red Dragon Pung", fan: 1, enabled: true },
  { id: "dragon-pung-green", name: "Green Dragon Pung", fan: 1, enabled: true },
  { id: "dragon-pung-white", name: "White Dragon Pung", fan: 1, enabled: true },
  { id: "seat-wind-pung", name: "Seat Wind Pung", fan: 1, enabled: true },
  { id: "round-wind-pung", name: "Round Wind Pung", fan: 1, enabled: true },
  { id: "all-chows", name: "All Chows", fan: 1, enabled: true, excludes: ["all-pungs"] },
  { id: "all-pungs", name: "All Pungs", fan: 3, enabled: true },
  { id: "half-flush", name: "Half Flush", fan: 3, enabled: true },
  { id: "mixed-one-suit", name: "Mixed One Suit", fan: 3, enabled: false, excludes: ["half-flush"], description: "Alias of Half Flush; enable only if your house scores it separately" },
  { id: "full-flush", name: "Full Flush", fan: 6, enabled: true, excludes: ["half-flush", "mixed-one-suit"] },
  { id: "all-honors", name: "All Honors", fan: 10, enabled: true, excludes: ["terminals-and-honors"] },
  { id: "all-terminals", name: "All Terminals", fan: 10, enabled: true, excludes: ["terminals-and-honors"] },
  { id: "terminals-and-honors", name: "Terminals and Honors", fan: 7, enabled: true },
  { id: "flower-seat", name: "Seat Flower", fan: 1, enabled: true, description: "Per flower matching your seat" },
  { id: "season-seat", name: "Seat Season", fan: 1, enabled: true, description: "Per season matching your seat" },
  { id: "flowers-complete", name: "Complete Flowers", fan: 2, enabled: true },
  { id: "seasons-complete", name: "Complete Seasons", fan: 2, enabled: true },
  { id: "seven-pairs", name: "Seven Pairs", fan: 4, enabled: true },
  { id: "thirteen-orphans", name: "Thirteen Orphans", fan: 10, enabled: true },
];

// PLACEHOLDER: capped fan -> base points.
export const DEFAULT_POINT_TABLE: Record<number, number> = { 1: 100, 2: 200, 3: 400, 4: 800, 5: 1200, 6: 1600, 7: 2400, 8: 3200, 9: 4800, 10: 6400 };

export const DEFAULT_GAME_CONFIG: GameConfig = {
  ...HK18_RULES,
  pointTable: DEFAULT_POINT_TABLE,
  selfDrawRules: { dealerMultiplier: 1, nonDealerMultiplier: 1 },
  discardRules: { dealerMultiplier: 1, paymentMode: "DISCARDER_PAYS_ALL" },
};
