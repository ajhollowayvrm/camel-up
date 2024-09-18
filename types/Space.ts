import { Camel, CamelColor } from "./Camel";
import { SpectatorToken } from "./SpectatorToken";

export type Space = {
  index: number;
  camelOnSpace: Camel | null;
  camelOrderOnSpace: CamelColor[];
  spectatorToken: SpectatorToken | null;
};
