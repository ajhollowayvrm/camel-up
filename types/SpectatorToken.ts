import { Player } from "./Player";

export type SpectatorToken = {
  value: -1 | 1;
  owner: Player;
};
