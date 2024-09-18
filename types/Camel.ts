export type Camel = {
  position: number; // Position on the track
  color: CamelColor; // Color or identifier for the camel, this is the id;
};

export type CamelColor =
  | "red"
  | "blue"
  | "green"
  | "yellow"
  | "purple"
  | "white"
  | "black";
