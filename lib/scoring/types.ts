export type Wind = "E" | "S" | "W" | "N";
export type Dragon = "RD" | "GD" | "WD";
export type NumberedTile = `${1|2|3|4|5|6|7|8|9}${"m"|"s"|"p"}`; // m=characters s=bamboo p=dots
export type PlayTile = NumberedTile | Wind | Dragon;
export type BonusTile = "F1"|"F2"|"F3"|"F4"|"S1"|"S2"|"S3"|"S4"; // flowers / seasons
export type Tile = PlayTile | BonusTile;

export type SetType = "CHOW" | "PUNG" | "KONG";
export type Meld = { type: SetType; tiles: PlayTile[]; exposed: boolean };
export type HandKind = "STANDARD" | "SEVEN_PAIRS" | "THIRTEEN_ORPHANS";
export type HandDecomposition = { kind: HandKind; sets: Meld[]; pair: PlayTile[] };

export type DiscardPaymentMode = "DISCARDER_PAYS_ALL" | "DISCARDER_FULL_OTHERS_HALF";

export type FanRuleConfig = {
  id: string; name: string; fan: number; enabled: boolean;
  excludes?: string[]; description?: string;
};
export type FanRule = FanRuleConfig & { check: (ctx: ScoringContext) => boolean | number };

export type GameConfig = {
  minimumFan: number;
  maximumFan: number;
  pointTable: Record<number, number>;          // capped fan -> base points
  enableFlowers: boolean;
  specialHands: { sevenPairs: boolean; thirteenOrphans: boolean };
  allChowsRequiresPlainPair: boolean;
  selfDrawRules: { dealerMultiplier: number; nonDealerMultiplier: number };
  discardRules: { dealerMultiplier: number; paymentMode: DiscardPaymentMode };
  fanTable?: FanRuleConfig[];                  // optional override of FAN_TABLE
};

export type WinningHandInput = {
  concealedTiles: PlayTile[]; // includes the winning tile
  melds: Meld[];
  winningTile: PlayTile;
  flowers: BonusTile[];
  winningMethod: "SELF_DRAW" | "DISCARD";
  winnerSeatWind: Wind;
  roundWind: Wind;
  isDealer: boolean;
  gameConfig: GameConfig;
};

export type ScoringContext = {
  kind: HandKind; sets: Meld[]; pair: PlayTile[]; allTiles: PlayTile[]; flowers: BonusTile[];
  method: "SELF_DRAW" | "DISCARD"; seatWind: Wind; roundWind: Wind; isDealer: boolean;
  winningTile: PlayTile; config: GameConfig;
};

export type DetectedFan = { id: string; name: string; fan: number };
export type ScoreDistribution = {
  winner: { playerId: string; points: number };
  payments: { playerId: string; points: number }[]; // points = amount paid
};
export type ScoringResult = {
  valid: boolean; errors: string[]; reason?: string;
  handDecomposition?: HandDecomposition;
  detectedFan: DetectedFan[];
  rawFan: number; cappedFan: number; totalFan: number; basePoints: number;
  scoreDistribution?: ScoreDistribution;
  explanation: string[];
  debug?: { possibleDecompositions: HandDecomposition[]; detectedRulesBeforeExclusions: string[]; excludedRules: string[] };
};
