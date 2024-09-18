import { WagerCard } from "./WagerCard";

export type Player = {
  id: number;
  name: string;
  coins: number;
  wagerCards: WagerCard[];
};
