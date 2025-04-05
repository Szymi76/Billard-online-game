import {
  BALL_RADIUS,
  BOARD_WIDTH,
  NUMBER_OF_PLAYERS_BALLS,
  TRIANGLE_ANCHOR,
} from "./constants";
import { Ball } from "./types";

// tworzenie nie poruszajacej sie kuli
export function createInitialBall(
  id: number,
  x: number,
  y: number,
  color = "red",
  canBeStrokeByPlayer = false
): Ball {
  return {
    id,
    x,
    y,
    angle: 0,
    velocity: 0,
    color,
    isPocketed: false,
    canBeStrokeByPlayer,
  };
}

// tworzenie trojkata z kulami wraz z kula biala. Czarna kula jest
// dodawana w srodku
export function createInitialBallsTrianglePositions(
  player1BallColor: string,
  player2BallColor: string
) {
  const x = TRIANGLE_ANCHOR.X;
  const y = TRIANGLE_ANCHOR.Y;
  const r = BALL_RADIUS;

  const colors = [
    "white",
    ...Array(NUMBER_OF_PLAYERS_BALLS / 2)
      .fill([player1BallColor, player2BallColor])
      .flat(),
  ];

  colors.splice(7, 0, "black");

  const positions = [
    { x: BOARD_WIDTH - x, y },
    { x, y },
    { x: x + r * 2, y: y + r },
    { x: x + r * 2, y: y - r },
    { x: x + r * 4, y },
    { x: x + r * 4, y: y + 2 * r },
    { x: x + r * 4, y: y - 2 * r },
    { x: x + r * 6, y: y + r },
    { x: x + r * 6, y: y - r },
    { x: x + r * 6, y: y + 3 * r },
    { x: x + r * 6, y: y - 3 * r },
    { x: x + r * 8, y },
    { x: x + r * 8, y: y + 2 * r },
    { x: x + r * 8, y: y - 2 * r },
    { x: x + r * 8, y: y + 4 * r },
    { x: x + r * 8, y: y - 4 * r },
  ];

  return colors.map((color, i) => {
    const { x, y } = positions[i];
    let canBeStrokeByPlayer = color == "white";
    return createInitialBall(i, x, y, color, canBeStrokeByPlayer);
  });

  // return DEBUG_BALLS.map((ball) => {return});
}

const DEBUG_BALLS: Ball[] = [
  {
    id: 0,
    x: 200,
    y: 200,
    angle: 0,
    velocity: 0,
    color: "white",
    canBeStrokeByPlayer: true,
    isPocketed: false,
  },
  {
    id: 1,
    x: 100,
    y: 100,
    angle: 0,
    velocity: 0,
    color: "black",
    canBeStrokeByPlayer: false,
    isPocketed: false,
  },
  {
    id: 2,
    x: 400,
    y: 200,
    angle: 0,
    velocity: 0,
    color: "blue",
    canBeStrokeByPlayer: false,
    isPocketed: false,
  },
  {
    id: 3,
    x: 600,
    y: 200,
    angle: 0,
    velocity: 0,
    color: "blue",
    canBeStrokeByPlayer: false,
    isPocketed: false,
  },
];
