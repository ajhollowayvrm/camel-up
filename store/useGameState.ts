import { ref, watch } from "vue";
import { Board } from "~/types/Board";
import { Camel, CamelColor } from "~/types/Camel";
import { DiceValue } from "~/types/DiceResults";
import { FinalWager } from "~/types/FinalWager";
import { GameState } from "~/types/GameState";
import { Player } from "~/types/Player";
import { AvailableWagerCards, RoundResults } from "~/types/RoundResults";
import { WagerCard, WagerCardColor } from "~/types/WagerCard";

export const useGameState = () => {
  const gameState = ref<GameState>({
    players: [] as Player[],
    board: initialBoard,
    currentActivePlayer: null,
    currentActivePlayerIndex: 0,
    currentRound: 0,
    camels: initialCamels,
    roundResults: [] as RoundResults[],
    isGameOver: false,
    finalWagers: [] as FinalWager[],
    winner: null,
  });

  watch(
    gameState.value.roundResults[gameState.value.currentRound].diceResults,
    (newVal) => {
      if (newVal.length === 5) {
        endRound();
      }
    }
  );

  const initializeGameState = (playerNames: string[]) => {
    gameState.value.players = initializePlayers(playerNames);
    gameState.value.currentActivePlayer = gameState.value.players[0];
    gameState.value.currentRound++;
    initializeRoundResults();
  };

  const initializePlayers = (playerNames: string[]) => {
    return playerNames.map((name, index) => ({
      id: index + 1,
      name,
      coins: 3,
      wagerCards: [] as WagerCard[],
    }));
  };

  const rollDice = () => {
    const regularDiceValues: DiceValue[] = [1, 2, 3, 1, 2, 3];
    const specialDiceValues: DiceValue[] = [1, 2, 3];
    const regularColors: CamelColor[] = [
      "red",
      "blue",
      "green",
      "yellow",
      "purple",
    ];
    const specialColors: CamelColor[] = ["white", "black"];

    const isSpecialDie = Math.random() < 1 / 6; // 1/6 chance for the special die

    if (isSpecialDie) {
      const randomIndex = Math.floor(Math.random() * specialDiceValues.length);
      const randomValue = specialDiceValues[randomIndex];
      const randomColor =
        specialColors[Math.floor(Math.random() * specialColors.length)];
      return { value: randomValue, color: randomColor };
    } else {
      const randomIndex = Math.floor(Math.random() * regularDiceValues.length);
      const randomValue = regularDiceValues[randomIndex];
      const randomColor =
        regularColors[Math.floor(Math.random() * regularColors.length)];
      gameState.value.roundResults[
        gameState.value.currentRound
      ].diceResults.push({
        value: randomValue,
        color: randomColor,
      });
      moveCamel({ value: randomValue, color: randomColor });
      return { value: randomValue, color: randomColor };
    }
  };

  const moveCamel = (diceResult: { value: DiceValue; color: CamelColor }) => {
    const { value, color } = diceResult;
    const camel = gameState.value.camels.find((c) => c.color === color);

    if (!camel) return;

    const currentSpace = gameState.value.board[camel.position];
    const isSpecialCamel = color === "white" || color === "black";
    const moveDirection = isSpecialCamel ? -1 : 1;
    const newPosition = Math.max(
      0,
      Math.min(
        camel.position + value * moveDirection,
        gameState.value.board.length - 1
      )
    );

    // Remove camel and all camels above it from the current space
    const camelIndex = currentSpace.camelOrderOnSpace.indexOf(color);
    const movingCamels = currentSpace.camelOrderOnSpace.splice(camelIndex);
    currentSpace.camelOnSpace =
      currentSpace.camelOrderOnSpace.length > 0
        ? gameState.value.camels.find(
            (c) =>
              c.color ===
              currentSpace.camelOrderOnSpace[
                currentSpace.camelOrderOnSpace.length - 1
              ]
          ) || null
        : null;

    // Add camel(s) to the new space
    const newSpace = gameState.value.board[newPosition];
    if (isSpecialCamel && newSpace.camelOrderOnSpace.length > 0) {
      // Special camels go under the stack
      newSpace.camelOrderOnSpace.unshift(...movingCamels);
    } else {
      // Regular camels (and special camels on empty spaces) go on top
      newSpace.camelOrderOnSpace.push(...movingCamels);
    }
    newSpace.camelOnSpace =
      gameState.value.camels.find(
        (c) =>
          c.color ===
          newSpace.camelOrderOnSpace[newSpace.camelOrderOnSpace.length - 1]
      ) || null;

    // Update camel positions
    movingCamels.forEach((camelColor) => {
      const camelToUpdate = gameState.value.camels.find(
        (c) => c.color === camelColor
      );
      if (camelToUpdate) camelToUpdate.position = newPosition;
    });
  };

  const makeWager = (player: Player, color: WagerCardColor) => {
    gameState.value.roundResults[gameState.value.currentRound].wagers.push({
      player,
      color,
    });
  };

  const makeFinalWager = (
    player: Player,
    camelColor: WagerCardColor,
    type: "first place" | "last place"
  ) => {
    gameState.value.finalWagers.push({
      player,
      camelColor,
      type,
    });
  };

  const createPartnership = (player1: Player, player2: Player) => {
    const currentPartnerships =
      gameState.value.roundResults[gameState.value.currentRound].partnerships;

    // Check if either player is already in a partnership this round
    const playerAlreadyPartnered = currentPartnerships.some(
      (partnership) =>
        partnership.player1.id === player1.id ||
        partnership.player1.id === player2.id ||
        partnership.player2.id === player1.id ||
        partnership.player2.id === player2.id
    );

    if (playerAlreadyPartnered) {
      return false;
    }

    currentPartnerships.push({
      player1,
      player2,
    });
    return true;
  };

  const placeSpectatorToken = (
    player: Player,
    spaceIndex: number,
    value: 1 | -1
  ): boolean => {
    // Check if the space already has a camel
    if (gameState.value.board[spaceIndex - 1].camelOnSpace !== null) {
      return false;
    }

    // Check if adjacent spaces have spectator tokens
    if (
      (spaceIndex > 1 &&
        gameState.value.board[spaceIndex - 2].spectatorToken !== null) ||
      (spaceIndex < gameState.value.board.length &&
        gameState.value.board[spaceIndex].spectatorToken !== null)
    ) {
      return false;
    }

    // Add to round results
    gameState.value.roundResults[
      gameState.value.currentRound
    ].spectatorTokens.push({
      value,
      owner: player,
    });

    // Add to the board
    gameState.value.board[spaceIndex - 1].spectatorToken = {
      value,
      owner: player,
    };

    return true;
  };

  const moveSpectatorToken = (
    player: Player,
    toSpaceIndex: number
  ): boolean => {
    // Find the current position of the player's spectator token
    const currentSpaceIndex = gameState.value.board.findIndex(
      (space) => space.spectatorToken?.owner.id === player.id
    );

    if (currentSpaceIndex === -1) {
      // Player doesn't have a spectator token on the board
      return false;
    }

    // Check if the destination space already has a camel
    if (gameState.value.board[toSpaceIndex - 1].camelOnSpace !== null) {
      return false;
    }

    // Check if adjacent spaces to the destination have spectator tokens
    if (
      (toSpaceIndex > 1 &&
        gameState.value.board[toSpaceIndex - 2].spectatorToken !== null) ||
      (toSpaceIndex < gameState.value.board.length &&
        gameState.value.board[toSpaceIndex].spectatorToken !== null)
    ) {
      return false;
    }

    // Store the spectator token to be moved
    const spectatorToken =
      gameState.value.board[currentSpaceIndex].spectatorToken!;

    // Remove the spectator token from the original space
    gameState.value.board[currentSpaceIndex].spectatorToken = null;

    // Add the spectator token to the new space
    gameState.value.board[toSpaceIndex - 1].spectatorToken = spectatorToken;

    // Update the round results
    const currentRoundResults =
      gameState.value.roundResults[gameState.value.currentRound];
    const tokenIndex = currentRoundResults.spectatorTokens.findIndex(
      (token) =>
        token.owner.id === player.id && token.value === spectatorToken.value
    );
    if (tokenIndex !== -1) {
      currentRoundResults.spectatorTokens[tokenIndex] = {
        ...spectatorToken,
      };
    }

    return true;
  };

  const endRound = () => {
    calculateRoundScore();
    clearSpectatorTokens();
    determineNextStartingRoundPlayer();
    initializeRoundResults();
  };

  const determineNextStartingRoundPlayer = () => {
    gameState.value.currentActivePlayerIndex =
      gameState.value.currentActivePlayerIndex + 1 >=
      gameState.value.players.length - 1
        ? 0
        : gameState.value.currentActivePlayerIndex + 1;
    gameState.value.currentActivePlayer =
      gameState.value.players[gameState.value.currentActivePlayerIndex];
  };

  const initializeRoundResults = () => {
    gameState.value.roundResults.push({
      round: gameState.value.currentRound,
      diceResults: [],
      wagers: [],
      availableWagerCards: initialAvailableWagerCards,
      partnerships: [],
      spectatorTokens: [],
    });
  };

  const clearSpectatorTokens = () => {
    gameState.value.board.forEach((space) => {
      space.spectatorToken = null;
    });
  };

  const calculateRoundScore = () => {};

  return {
    gameState,
    initializeGameState,
    rollDice,
    makeWager,
    makeFinalWager,
    createPartnership,
    placeSpectatorToken,
    moveSpectatorToken,
  };
};

const initialBoard: Board = [
  { index: 1, camelOnSpace: null, camelOrderOnSpace: [], spectatorToken: null },
  { index: 2, camelOnSpace: null, camelOrderOnSpace: [], spectatorToken: null },
  { index: 3, camelOnSpace: null, camelOrderOnSpace: [], spectatorToken: null },
  { index: 4, camelOnSpace: null, camelOrderOnSpace: [], spectatorToken: null },
  { index: 5, camelOnSpace: null, camelOrderOnSpace: [], spectatorToken: null },
  { index: 6, camelOnSpace: null, camelOrderOnSpace: [], spectatorToken: null },
  { index: 7, camelOnSpace: null, camelOrderOnSpace: [], spectatorToken: null },
  { index: 8, camelOnSpace: null, camelOrderOnSpace: [], spectatorToken: null },
  { index: 9, camelOnSpace: null, camelOrderOnSpace: [], spectatorToken: null },
  {
    index: 10,
    camelOnSpace: null,
    camelOrderOnSpace: [],
    spectatorToken: null,
  },
  {
    index: 11,
    camelOnSpace: null,
    camelOrderOnSpace: [],
    spectatorToken: null,
  },
  {
    index: 12,
    camelOnSpace: null,
    camelOrderOnSpace: [],
    spectatorToken: null,
  },
  {
    index: 13,
    camelOnSpace: null,
    camelOrderOnSpace: [],
    spectatorToken: null,
  },
  {
    index: 14,
    camelOnSpace: null,
    camelOrderOnSpace: [],
    spectatorToken: null,
  },
  {
    index: 15,
    camelOnSpace: null,
    camelOrderOnSpace: [],
    spectatorToken: null,
  },
  {
    index: 16,
    camelOnSpace: null,
    camelOrderOnSpace: [],
    spectatorToken: null,
  },
];

const initialCamels: Camel[] = [
  { color: "red", position: 0 },
  { color: "blue", position: 0 },
  { color: "green", position: 0 },
  { color: "yellow", position: 0 },
  { color: "purple", position: 0 },
  { color: "white", position: 0 },
  { color: "black", position: 0 },
];

const initialAvailableWagerCards: AvailableWagerCards[] = [
  { color: "red", amounts: [5, 3, 2, 2] },
  { color: "blue", amounts: [5, 3, 2, 2] },
  { color: "green", amounts: [5, 3, 2, 2] },
  { color: "yellow", amounts: [5, 3, 2, 2] },
  { color: "purple", amounts: [5, 3, 2, 2] },
];
