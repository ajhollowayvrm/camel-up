import { Player } from "./Player";

export type WagerCard = {
  player: Player;
  color: WagerCardColor;
};

export type WagerCardColor = "red" | "blue" | "green" | "yellow" | "purple";
