import { Hole } from "./types";

export const FRAMES_PER_SECOND = 60;
export const BALL_RADIUS = 15;
export const BOARD_WIDTH = 875;
export const BOARD_HEIGHT = 400;
export const BALL_COLLISION_OFFSET = 1;
export const WALL_COLLISION_OFFSET = 20;
export const BALL_VELOCITY_LOST_PER_FRAME = 0.01;
export const NORMAL_HOLE_RADIUS = 27;
export const CORNER_HOLE_RADIUS = 43;
export const POWER_DIVIDER = 8;
export const BALL_HOLE_OFFSET = 5;
export const COLLISION_SHIFT_OFFSET = 0;
export const NUMBER_OF_PLAYERS_BALLS = 14;
export const BOARD_OFFSET = 100;
export const TRIANGLE_ANCHOR = {
  X: BOARD_WIDTH * (3 / 4),
  Y: BOARD_HEIGHT / 2,
};

export const INITIAL_HOLES: Hole[] = [
  { x: 0, y: 0, radius: CORNER_HOLE_RADIUS },
  { x: BOARD_WIDTH / 2, y: 0, radius: NORMAL_HOLE_RADIUS },
  { x: BOARD_WIDTH, y: 0, radius: CORNER_HOLE_RADIUS },
  { x: 0, y: BOARD_HEIGHT, radius: CORNER_HOLE_RADIUS },
  { x: BOARD_WIDTH / 2, y: BOARD_HEIGHT, radius: NORMAL_HOLE_RADIUS },
  { x: BOARD_WIDTH, y: BOARD_HEIGHT, radius: CORNER_HOLE_RADIUS },
];
