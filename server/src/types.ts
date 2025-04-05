export type Board = { width: number; height: number };

export type Ball = {
  id: number;
  x: number;
  y: number;
  angle: number;
  velocity: number;
  color: string;
  canBeStrokeByPlayer: boolean;
  isPocketed: boolean;
};

export type Hole = {
  x: number;
  y: number;
  radius: number;
};

export type Pool = {
  board: Board;
  balls: Ball[];
  holes: Hole[];
};

export type User = {
  socketId: string;
  nickname: string;
  roomId: string;
  ballColor: string;
};

export type Room = {
  id: string;
  player1: User | null;
  player2: User | null;
  balls: Ball[];
  currentTurn: string;
  winnerSocketId: string | null;
  status: "waiting" | "in_progress" | "finished";
  players: () => User[];
  addPlayer: (newPlayer: User) => void;
  includesSpecificSocketId: (socketId: string) => boolean;
  removePlayer: (socketId: string) => User | null;
};

export type RoomMap = Map<string, Room>;
