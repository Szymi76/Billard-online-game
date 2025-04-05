import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { RoomMap, User } from "./types";
import { v4 as uuid } from "uuid";
import { createRoom, isGameEnded, wait } from "./utils";
import {
  areAllBallsNotMoving,
  calcBallStrike,
  getNewBallsPositions,
} from "./functions";
import { createInitialBallsTrianglePositions } from "./ballsUtils";
import { FRAMES_PER_SECOND } from "./constants";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

app.use(cors());

export const rooms: RoomMap = new Map();

io.on("connection", (socket) => {
  // wysylanie adresatowi jego socket.id
  socket.emit("connection__successful", socket.id);

  // dolaczanie do pokoju
  socket.on("join_room", (roomId: string, nickname: string) => {
    const room = rooms.get(roomId);

    // sprawdzanie czy pokoj istnieje
    if (!room) {
      socket.emit("join_room__failure", { message: "Room does not exists" });
      return;
    }

    // sprawdzanie czy w pokoju jest mniej niz 2 osoby
    if (room.players().length >= 2) {
      socket.emit("join_room__failure", {
        message: "Room has already two players",
      });
      return;
    }

    // nadawanie domyslnego koloru kuli
    let ballColor = "red";
    if (room.players().length == 1) {
      ballColor = "blue";
      room.status = "in_progress";
    }

    // dodawanie gracza do pokoju i aktualizacja mapy pokoi
    const user: User = { socketId: socket.id, nickname, roomId, ballColor };
    room.addPlayer(user);
    rooms.set(roomId, room);
    socket.join(roomId);

    // kazda kula dostaje kolor przynalezacy do gracza
    room.balls = createInitialBallsTrianglePositions(
      room.player1!.ballColor,
      room.player2!.ballColor
    );

    // informacja zwrotna do uczestnikow pokoju
    io.to(roomId).emit("join_room__success", user, room);
  });

  // tworzenie nowego pokoju
  socket.on("create_room", (nickname: string) => {
    const isUserAlreadyInOtherRoom = Array.from(rooms.values()).some((room) => {
      room.includesSpecificSocketId(socket.id);
    });

    // sprawdzanie czy uzytkownik nie jest juz w innym pokoju
    if (isUserAlreadyInOtherRoom) {
      socket.emit("create_room__failure", {
        message: "You are already in different room",
      });
      return;
    }

    // tworzenie nowego pokoju i dolaczanie do niego
    const roomId = uuid();
    const user = { socketId: socket.id, nickname, roomId, ballColor: "red" };
    const room = createRoom(roomId, user);
    const balls = createInitialBallsTrianglePositions("red", "red");
    console.log(
      "INDEX",
      balls.map((b) => b.isPocketed)
    );
    room.balls = balls;
    rooms.set(roomId, room);
    socket.join(roomId);

    socket.emit("create_room__success", user, room);
  });

  // opuszczanie pokoju
  socket.on("leave_room", (roomId: string) => {
    const room = rooms.get(roomId);

    // sprawdzanie czy pokoj istnieje
    if (!room) {
      socket.emit("leave_room__failure", {
        message: "Can't leave not existing room",
      });
      return;
    }

    // sprawdzanie czy gracz ktorego chcemy usunac w ogole znajduje sie w tym pokoju
    const deletedUser = room.removePlayer(socket.id);
    if (!deletedUser) {
      socket.emit("leave_room__failure", {
        message: "Can't leave room that you are not in",
      });
      return;
    }
    // usuwanie uzytkownika z pokoju
    rooms.set(roomId, room);
    socket.leave(roomId);
    socket.emit("leave_room__success", deletedUser, room);
    io.to(roomId).emit("leave_room__success", deletedUser, room);
  });

  // uderzenie kuli
  socket.on(
    "strike_ball",
    async (roomId: string, ballId: number, angle: number, power: number) => {
      const SERVER_DELAY_CORRECTION = 150;
      const room = rooms.get(roomId);

      // sprawdzanie czy pokoj w ogole istniej
      if (!room) {
        socket.emit("strike_ball__failure", {
          message: "Can't strike a ball in not existing room",
        });
        return;
      }

      // sprawdzanie czy faktycznie zgodna osoba wykonuje uderzenie
      if (room.currentTurn !== socket.id) {
        socket.emit("strike_ball__failure", {
          message: "You can't strike a ball. It is not your turn!",
        });
        return;
      }

      // tworzenie nowych kul i wysylanie ich do klienta
      let balls = calcBallStrike(room.balls, ballId, angle, power);
      io.to(roomId).emit("strike_ball__success", room, balls);

      // petla ktora nasladuje ruchy po stronie klienta
      while (!areAllBallsNotMoving(balls)) {
        if (!rooms.get(roomId)) break;
        await wait((1000 - SERVER_DELAY_CORRECTION) / FRAMES_PER_SECOND);
        balls = getNewBallsPositions(balls);
        room.balls = balls;
        // io.to(roomId).emit("strike_ball__success", room, balls);

        const winnerSocketId = isGameEnded(room);
        if (winnerSocketId) {
          room.status = "finished";
          room.winnerSocketId = winnerSocketId;
          break;
        }
      }

      // if (!rooms.get(roomId)) {
      //   socket.emit("strike_ball__failure", {
      //     message: "Can't strike a ball in not existing room!",
      //   });
      // }

      const upToDateRoom = rooms.get(roomId);
      if (!upToDateRoom || upToDateRoom.players().length != 2) {
        socket.emit("strike_ball__failure", {
          message:
            "Can't strike a ball if it is not have 2 players or room now does not exists!",
        });
        return;
      }

      room.currentTurn == room.player1?.socketId
        ? (room.currentTurn = room.player2!.socketId)
        : (room.currentTurn = room.player1!.socketId);
      console.log(room.currentTurn);
      io.to(roomId).emit("strike_ball__success", room, balls);
    }
  );

  // startowanie nowej rozgrywki
  socket.on("start_new_game", (roomId: string) => {
    const room = rooms.get(roomId);

    // sprawdzanie czy pokoj w ogole istnieje
    if (!room) {
      socket.emit("start_new_game__failure", {
        message: "Can't start new game in not existing room",
      });
      return;
    }

    // sprawdzanie czy jest dwoch graczy w pokoju
    if (room.players().length != 2) {
      socket.emit("start_new_game__failure", {
        message: "You can start new game if it is 2 players in the room",
      });
      return;
    }

    room.balls = createInitialBallsTrianglePositions(
      room.player1!.ballColor,
      room.player2!.ballColor
    );
    room.status = "in_progress";
    room.winnerSocketId = null;

    io.to(roomId).emit("start_new_game__success", room);
  });

  // rozlaczenie uzytkownika
  socket.on("disconnect", () => {
    // sprawdzanie czy uzytkownik nie jest w jakims pokoju
    const userRoom = Array.from(rooms.values()).find((room) => {
      room.includesSpecificSocketId(socket.id);
    });
    if (!userRoom) return;

    // usuwanie uzytkownika z pokoju
    const deletedUser = userRoom.removePlayer(socket.id);
    socket.leave(userRoom.id);
    rooms.set(userRoom.id, userRoom);
    io.to(userRoom.id).emit("leave_room__success", deletedUser, userRoom);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Serwer działa na http://localhost:${PORT}`);
});
