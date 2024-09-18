import { Player } from "./Player";
import { WagerCardColor } from "./WagerCard";

export type FinalWager = {
  player: Player;
  camelColor: WagerCardColor;
  type: "first place" | "last place";
};
