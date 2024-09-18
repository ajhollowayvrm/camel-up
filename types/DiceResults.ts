import { CamelColor } from "./Camel";

export type DiceResults = {
  value: DiceValue | null;
  color: CamelColor | null;
};

export type DiceValue = 1 | 2 | 3;
