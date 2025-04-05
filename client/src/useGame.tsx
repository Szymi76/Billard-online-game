import { createContext, useContext, useEffect, useState } from "react";
import { Ball, Pool, Room, User } from "./types";
import { socket } from "./socket";
import { getNewBallsPositions, areAllBallsNotMoving } from "./functions";
import { wait } from "./utils";
import { FRAMES_PER_SECOND } from "./constants";

type GameContext = {
  user: User | null;
  room: Room | null;
  balls: Ball[];

  isEveryBallStill: () => boolean;
  joinRoom: (roomId: string, nickname: string) => void;
  createRoom: (nickname: string) => void;
  leaveRoom: () => void;
  strikeBall: (ballId: number, angle: number, power: number) => void;
  startNewGame: () => void;
};

export const GameContext = createContext<GameContext | null>(null);

type GameProviderProps = { children: React.ReactNode };
export const GameProvider = (props: GameProviderProps) => {
  const [balls, setBalls] = useState<Ball[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [room, setRoom] = useState<Room | null>(null);

  useEffect(() => {
    const handleBallsSimulation = async () => {
      while (!areAllBallsNotMoving(balls)) {
        const newBalls = getNewBallsPositions(balls);
        setBalls(newBalls);
        setRoom((room) => {
          if (!room) return room;
          return { ...room, balls: newBalls };
        });
        await wait(1000 / FRAMES_PER_SECOND);
      }
    };

    handleBallsSimulation();
  }, [balls]);

  useEffect(() => {
    // udane dolaczenie do pokoju
    socket.on("join_room__success", (newUser: User, newRoom: Room) => {
      if (!user?.socketId) setUser(newUser);
      setRoom(newRoom);
      setBalls(newRoom.balls);
    });

    // nieudane dolaczenie do pokoju
    socket.on("join_room__failure", ({ message }) => {
      console.log(message);
    });

    // udane stworzenie pokoju
    socket.on("create_room__success", (newUser: User, newRoom: Room) => {
      if (!user?.socketId) setUser(newUser);
      setRoom(newRoom);
      setBalls(newRoom.balls);
    });

    // nieudane stworzenie do pokoju
    socket.on("create_room__failure", ({ message }) => {
      console.log(message);
    });

    // udane opuszczenie pokoju
    socket.on("leave_room__success", (deletedUser: User, room: Room) => {
      if (user?.socketId === deletedUser.socketId) {
        setRoom(null);
        setUser(null);
      } else setRoom(room);
    });

    // nieudane opuszczenie pokoju
    socket.on("leave_room__failure", ({ message }) => {
      console.log(message);
    });

    socket.on("strike_ball__success", (room, balls) => {
      setRoom(room);
      setBalls(balls);
    });

    socket.on("strike_ball__failure", ({ message }) => {
      console.log(message);
    });

    socket.on("start_new_game__success", (room: Room) => {
      setRoom(room);
      setBalls(room.balls);
    });

    socket.on("start_new_game__failure", ({ message }) => {
      console.log(message);
    });

    return () => {
      socket.off("join_room__success");
      socket.off("join_room__failure");
      socket.off("create_room__success");
      socket.off("create_room__failure");
      socket.off("leave_room__success");
      socket.off("leave_room__failure");
      socket.off("strike_ball__success");
      socket.off("strike_ball__failure");
      socket.off("start_new_game__success");
      socket.off("start_new_game__failure");
    };
  }, [user]);

  const isEveryBallStill = () => {
    return balls.every((ball) => ball.velocity === 0);
  };

  const joinRoom = (roomId: string, nickname: string) => {
    socket.emit("join_room", roomId, nickname);
  };

  const createRoom = (nickname: string) => {
    socket.emit("create_room", nickname);
  };

  const leaveRoom = () => {
    socket.emit("leave_room", room!.id);
  };

  const strikeBall = (ballId: number, angle: number, power: number) => {
    if (!room) return;
    socket.emit("strike_ball", room.id, ballId, angle, power);
  };

  const startNewGame = () => {
    if (!room || (room && room.status != "finished")) return;
    socket.emit("start_new_game", room.id);
  };

  const value: GameContext = {
    user,
    room,
    balls,
    isEveryBallStill,
    joinRoom,
    createRoom,
    leaveRoom,
    strikeBall,
    startNewGame,
  };

  return <GameContext.Provider children={props.children} value={value} />;
};

export const useGame = () => {
  const context = useContext(GameContext);

  if (!context) throw new Error("Hook used outside of provider!");
  return context;
};
