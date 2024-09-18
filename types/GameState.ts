import { Board } from "./Board";
import { Camel } from "./Camel";
import { FinalWager } from "./FinalWager";
import { Player } from "./Player";
import { RoundResults } from "./RoundResults";

export type GameState = {
  players: Player[];
  board: Board;
  currentActivePlayer: Player | null;
  currentActivePlayerIndex: number;
  currentRound: number;
  camels: Camel[]; // Represents the camels and their positions on the board
  roundResults: RoundResults[];
  finalWagers: FinalWager[];
  isGameOver: boolean; // Flag to indicate if the game has ended
  winner: Player | null; // Player who won, if the game is over
};
