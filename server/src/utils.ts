import { createInitialBallsTrianglePositions } from "./ballsUtils";
import { Room, User } from "./types";

// Zwraca 2-elementowe kombinacje bez powtorzen
// np. dla tablicy [a, b, c] => [[a, b], [b, c], [a, c]]
export function getCombinations<T>(array: T[]) {
  const result = [];
  for (let i = 0; i < array.length; i++) {
    for (let j = i + 1; j < array.length; j++) {
      result.push([array[i], array[j]]);
    }
  }

  return result;
}

// sprowadza dowolny kat do zakresu <0, 360>
// np. dla -390 => 330
// dodane, aby funkcja do sprawdzania czy kula jest poza stolem nie wywalala bledow
export function normalizeAngle(angle: number) {
  return ((angle % 360) + 360) % 360;
}

// sprawdza czy wartosc 'n' jest w przedziale <start, end>
// np. dla n = 10, start = 5, end = 15 funkcja zwraca true
export function between(n: number, start: number, end: number): boolean {
  return n >= start && n <= end;
}

// oblicza wspolrzedne punktu P2 majac punkt P1, kat oraz dlugosc
export function getPointFromAngle(
  x1: number,
  y1: number,
  angle: number,
  length: number
) {
  const angleRad = angle * (Math.PI / 180);
  const x2 = x1 + length * Math.cos(angleRad);
  const y2 = y1 + length * Math.sin(angleRad);
  return { x: x2, y: y2 };
}

// tworzenie nowego pokoju z jednym uzytkownikiem
export function createRoom(roomId: string, creator: User): Room {
  const room: Room = {
    id: roomId,
    player1: creator,
    player2: null,
    balls: createInitialBallsTrianglePositions("red", "red"),
    currentTurn: creator.socketId,
    status: "waiting",
    winnerSocketId: null,

    // pobieranie wszystkich graczy w pokoju, ktorzy nie sa null
    players() {
      const result = [this.player1, this.player2].filter((player) =>
        Boolean(player)
      ) as User[];
      return result;
    },

    // dodawanie nowego gracza do pokoju
    addPlayer(newPlayer) {
      if (!this.player1) this.player1 = newPlayer;
      else if (!this.player2) this.player2 = newPlayer;
      else return;
    },

    // sprawdza czy pokoj zawiera konkretnego uzytkownika po sockecie
    includesSpecificSocketId(socketId) {
      return this.players().some((user) => user.socketId == socketId);
    },

    // usuwanie gracza z pokoju na podstawie socketu
    removePlayer(socketId) {
      if (this.player1?.socketId === socketId) {
        const deletedUser = this.player1;
        this.player1 = null;
        return deletedUser;
      }
      if (this.player2?.socketId === socketId) {
        const deletedUser = this.player2;
        this.player2 = null;
        return deletedUser;
      }
      return null;
    },
  };

  return room;
}

export function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export function isGameEnded(room: Room): string | null {
  if (room.players().length != 2) return null;

  const ballsInHoles = room.balls.filter((ball) => ball.isPocketed);
  const notCurrentTurn =
    room.currentTurn == room.player1!.socketId
      ? room.player2!.socketId
      : room.player1!.socketId;

  // sprawdzanie czy wpadla biala bila
  const whiteBall = ballsInHoles.find((ball) => ball.color == "white");
  if (whiteBall) return notCurrentTurn;

  // sprawdzanie czy wpadala czarna bila
  const blackBall = ballsInHoles.find((ball) => ball.color == "black");
  if (blackBall) {
    const player1BallsInHoles = ballsInHoles.filter(
      (ball) => ball.color == room.player1!.ballColor
    );
    const player2BallsInHoles = ballsInHoles.filter(
      (ball) => ball.color == room.player2!.ballColor
    );

    // const numberOfBallsForEveryUser = NUMBER_OF_PLAYERS_BALLS / 2
    const numberOfBallsForEveryUser = 1;

    if (player1BallsInHoles.length == numberOfBallsForEveryUser)
      return room.player1!.socketId;
    if (player2BallsInHoles.length == numberOfBallsForEveryUser)
      return room.player2!.socketId;

    return notCurrentTurn;
  }

  return null;
}
