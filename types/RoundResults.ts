import { DiceResults } from "./DiceResults";
import { Partnership } from "./Partnership";
import { SpectatorToken } from "./SpectatorToken";
import { WagerCard, WagerCardColor } from "./WagerCard";

export type RoundResults = {
  round: number;
  diceResults: DiceResults[];
  wagers: WagerCard[];
  availableWagerCards: AvailableWagerCards[];
  spectatorTokens: SpectatorToken[];
  partnerships: Partnership[];
};

export type AvailableWagerCards = {
  color: WagerCardColor;
  amounts: WagerCardValues[];
};

export type WagerCardValues = 5 | 3 | 2 | 2;
