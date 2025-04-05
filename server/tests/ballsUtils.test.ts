import { createInitialBallsTrianglePositions } from "../src/ballsUtils";
import { NUMBER_OF_PLAYERS_BALLS } from "../src/constants";

describe("Testowanie mniejszych funkcji zwiazanych z kulami bilardowymi", () => {
  test("Tworzenie domyslnej tablicy z kulami, [bez uzytkownikow]", () => {
    const BASE_COLOR = "red";
    const balls = createInitialBallsTrianglePositions(BASE_COLOR, BASE_COLOR);
    expect(balls).toHaveLength(NUMBER_OF_PLAYERS_BALLS + 2);

    const whiteBallIndex = balls.findIndex((ball) => ball.color == "white");
    const blackBallIndex = balls.findIndex((ball) => ball.color == "black");
    const restOfBalls = balls.filter(
      (_, index) => index != whiteBallIndex && index != blackBallIndex
    );
    expect(whiteBallIndex).not.toBe(-1);
    expect(blackBallIndex).not.toBe(-1);
    expect(restOfBalls).toHaveLength(NUMBER_OF_PLAYERS_BALLS);
  });

  test("Tworzenie tablicy z kulami, [z uzytkownikami]", () => {
    const PLAYER1_COLOR = "red";
    const PLAYER2_COLOR = "blue";

    const balls = createInitialBallsTrianglePositions(
      PLAYER1_COLOR,
      PLAYER2_COLOR
    );
    expect(balls).toHaveLength(NUMBER_OF_PLAYERS_BALLS + 2);

    const player1Balls = balls.filter((ball) => ball.color == PLAYER1_COLOR);
    const player2Balls = balls.filter((ball) => ball.color == PLAYER2_COLOR);

    expect(player1Balls.length).toBe(NUMBER_OF_PLAYERS_BALLS / 2);
    expect(player2Balls.length).toBe(NUMBER_OF_PLAYERS_BALLS / 2);
  });
});
