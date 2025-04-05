import {
  BALL_VELOCITY_LOST_PER_FRAME,
  BALL_RADIUS,
  WALL_COLLISION_OFFSET,
  BALL_COLLISION_OFFSET,
  BOARD_WIDTH,
  BOARD_HEIGHT,
  POWER_DIVIDER,
  BALL_HOLE_OFFSET,
  INITIAL_HOLES,
} from "./constants";
import { Ball, Hole } from "./types";
import { between, getCombinations, normalizeAngle } from "./utils";

// funkcja zajmuje sie obliczaniem nowych predkosci i katow po zderzeniu sie dwoch kol
// zrobione przy pomocy czatuGPT :|
export function calculateCollision(ball1: Ball, ball2: Ball) {
  let dx = ball2.x - ball1.x;
  let dy = ball2.y - ball1.y;

  // Obliczamy kąty i prędkości po kolizji
  let angle = Math.atan2(dy, dx); // Kąt normalny do powierzchni kontaktu

  // Kąty i prędkości przed kolizją w kierunku X, Y
  let velocity1X = ball1.velocity * Math.cos((ball1.angle * Math.PI) / 180);
  let velocity1Y = ball1.velocity * Math.sin((ball1.angle * Math.PI) / 180);
  let velocity2X = ball2.velocity * Math.cos((ball2.angle * Math.PI) / 180);
  let velocity2Y = ball2.velocity * Math.sin((ball2.angle * Math.PI) / 180);

  // Obliczanie nowej prędkości w kierunku normalnym
  let normal1 = Math.cos(angle);
  let normal2 = Math.sin(angle);

  let velocity1Normal = velocity1X * normal1 + velocity1Y * normal2;
  let velocity2Normal = velocity2X * normal1 + velocity2Y * normal2;

  // Wymiana prędkości w kierunku normalnym
  let newVelocity1Normal = velocity2Normal;
  let newVelocity2Normal = velocity1Normal;

  // Obliczanie nowych prędkości po kolizji
  let newVelocity1X =
    velocity1X - velocity1Normal * normal1 + newVelocity1Normal * normal1;
  let newVelocity1Y =
    velocity1Y - velocity1Normal * normal2 + newVelocity1Normal * normal2;

  let newVelocity2X =
    velocity2X - velocity2Normal * normal1 + newVelocity2Normal * normal1;
  let newVelocity2Y =
    velocity2Y - velocity2Normal * normal2 + newVelocity2Normal * normal2;

  // Prędkości po kolizji
  ball1.velocity = Math.sqrt(
    newVelocity1X * newVelocity1X + newVelocity1Y * newVelocity1Y
  );
  ball2.velocity = Math.sqrt(
    newVelocity2X * newVelocity2X + newVelocity2Y * newVelocity2Y
  );

  // Nowe kąty
  ball1.angle = normalizeAngle(
    (Math.atan2(newVelocity1Y, newVelocity1X) * 180) / Math.PI
  );
  ball2.angle = normalizeAngle(
    (Math.atan2(newVelocity2Y, newVelocity2X) * 180) / Math.PI
  );
}

// funkcja sprawdza czy dana kula wyjdzie poza stol
export function isBallWillBeOutsideOfTheBoard(ball: Ball) {
  const x = ball.x + Math.cos((ball.angle * Math.PI) / 180) * ball.velocity;
  const y = ball.y + Math.sin((ball.angle * Math.PI) / 180) * ball.velocity;

  if (
    x < WALL_COLLISION_OFFSET ||
    x > BOARD_WIDTH - WALL_COLLISION_OFFSET ||
    y < WALL_COLLISION_OFFSET ||
    y > BOARD_HEIGHT - WALL_COLLISION_OFFSET
  )
    return true;
  return false;
}

// funkcja sprawdza czy dwie kule na siebie nachodza oraz czy symulujac przyszly ruch to czy sie oddalaja czy zbilazja
export function areTwoBallsCollide(ball1: Ball, ball2: Ball) {
  const BALL_RADIUS_WITH_OFFSET = BALL_RADIUS + BALL_COLLISION_OFFSET;

  const p1 = { x: ball1.x, y: ball1.y };
  const p2 = { x: ball2.x, y: ball2.y };

  const distance = getDistanceBetweenTwoPoints(p1, p2);

  const futureP1 = calcNewBallPosition(ball1);
  const futureP2 = calcNewBallPosition(ball2);
  const futureDistance = getDistanceBetweenTwoPoints(futureP1, futureP2);

  if (BALL_RADIUS_WITH_OFFSET * 2 > distance && futureDistance <= distance)
    return true;
  return false;
}

// funkcja sprawdza czy kula wyszla poza rog stolu
export function didBallHitCorner(ball: Ball) {
  const { x, y } = ball;

  if (x < BALL_COLLISION_OFFSET && y < BALL_COLLISION_OFFSET) return true;
  if (x > BOARD_WIDTH - BALL_COLLISION_OFFSET && y < BALL_COLLISION_OFFSET)
    return true;
  if (x < BALL_COLLISION_OFFSET && y > BOARD_HEIGHT - BALL_COLLISION_OFFSET)
    return true;
  if (
    x > BOARD_WIDTH - BALL_COLLISION_OFFSET &&
    y > BOARD_HEIGHT - BALL_COLLISION_OFFSET
  )
    return true;
  return false;
}

// funkcja wprowadza korekte gdy kula przy kolejnym ruchu wyszla by poza stol
export function correctBallAngleIfItIsOutsideOfTheBoard(ball: Ball) {
  const { x, y, angle } = ball;

  if (didBallHitCorner(ball)) {
    ball.angle = normalizeAngle(ball.angle + 180);
  } else if (x < WALL_COLLISION_OFFSET && between(angle, 90, 270))
    ball.angle = normalizeAngle(180 - ball.angle);
  else if (
    x > BOARD_WIDTH - WALL_COLLISION_OFFSET &&
    (between(angle, 0, 90) || between(angle, 270, 360))
  )
    ball.angle = normalizeAngle(180 - ball.angle);
  else if (y < WALL_COLLISION_OFFSET && between(angle, 180, 360))
    ball.angle = normalizeAngle(-ball.angle);
  else if (y > BOARD_HEIGHT - WALL_COLLISION_OFFSET && between(angle, 0, 180))
    ball.angle = normalizeAngle(-ball.angle);
}

// funkcja sprawdza czy bila wpadla do jakiejkolwiek dziury
export function isBallInHole(ball: Ball, holes: Hole[]): boolean {
  return holes.some((hole) => {
    const dx = ball.x - hole.x;
    const dy = ball.y - hole.y;
    return Math.sqrt(dx * dx + dy * dy) < hole.radius - BALL_HOLE_OFFSET;
  });
}

// funkcja nadaje kat oraz predkosc kuli po uderzeniu kijem
export function calcBallStrike(
  balls: Ball[],
  ballId: number,
  angle: number,
  power: number
) {
  const ballIndex = getBallIndexById(balls, ballId);
  balls[ballIndex] = {
    ...balls[ballIndex],
    angle,
    velocity: power / POWER_DIVIDER,
  };
  return balls;
}

// funkcja wprowadza aktualizacje w kulach na podstawie tego czy jakies sie ze soba zderzyly,
// czy jakas wpadla do dziury, czy uderzyla w sciane, itd.
export function getNewBallsPositions(balls: Ball[]) {
  const activeBalls = balls.filter((ball) => !ball.isPocketed);

  const ballsPairs = getCombinations(activeBalls);
  for (let i = 0; i < ballsPairs.length; i++) {
    const ball1 = ballsPairs[i][0];
    const ball2 = ballsPairs[i][1];
    if (areTwoBallsCollide(ball1, ball2)) {
      calculateCollision(ball1, ball2);
    }
  }

  for (let i = 0; i < balls.length; i++) {
    const ball = balls[i];
    if (ball.isPocketed) continue;

    if (isBallWillBeOutsideOfTheBoard(ball))
      correctBallAngleIfItIsOutsideOfTheBoard(ball);
    calcNewPositionAndVelocity(ball);
    if (isBallInHole(ball, INITIAL_HOLES))
      balls[i] = { ...ball, angle: 0, velocity: 0, isPocketed: true };
  }

  return balls;
}

//
// POOL UTILS
//

// funkcja oblicza nowa predkosc i pozycje kuli
export function calcNewPositionAndVelocity(ball: Ball) {
  const { x, y } = calcNewBallPosition(ball);
  ball.x = x;
  ball.y = y;
  ball.velocity = Math.max(ball.velocity - BALL_VELOCITY_LOST_PER_FRAME, 0);
}

// oblicza nowa pozycje kuli na podstawie jej poprzedniej pozycji, kata i predkosci
function calcNewBallPosition(ball: Ball) {
  const x = ball.x + Math.cos((ball.angle * Math.PI) / 180) * ball.velocity;
  const y = ball.y + Math.sin((ball.angle * Math.PI) / 180) * ball.velocity;
  return { x, y };
}

// zwraca index kuli w tablica na podstawie id
export function getBallIndexById(balls: Ball[], ballId: number) {
  return balls.findIndex((ball) => ball.id == ballId);
}

// zwraca odleglosc pomiedzy dwoma punktami P1 = (x1, y1) oraz P2 = (x2, y2)
export function getDistanceBetweenTwoPoints(
  p1: { x: number; y: number },
  p2: { x: number; y: number }
) {
  const xDiffPow = Math.pow(p1.x - p2.x, 2);
  const yDiffPow = Math.pow(p1.y - p2.y, 2);
  const distance = Math.sqrt(xDiffPow + yDiffPow);
  return distance;
}

export function areAllBallsNotMoving(balls: Ball[]) {
  return balls.every((ball) => ball.velocity == 0);
}
