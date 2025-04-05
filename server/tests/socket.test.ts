import { createServer } from "node:http";
import { type AddressInfo } from "node:net";
import { io as ioc, type Socket as ClientSocket } from "socket.io-client";
import {
  DefaultEventsMap,
  Server,
  type Socket as ServerSocket,
} from "socket.io";
import { Room, User } from "../src/types";

function waitFor(socket: ServerSocket | ClientSocket, event: string) {
  return new Promise((resolve) => {
    socket.once(event, resolve);
  });
}

describe("Testowanie komunikacji: Server - Client", () => {
  let io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
  let serverSocket: ServerSocket;
  let clientSocket: ClientSocket;

  beforeAll((done) => {
    const httpServer = createServer();
    io = new Server(httpServer);
    httpServer.listen(() => {
      const port = (httpServer.address() as AddressInfo).port;
      clientSocket = ioc(`http://localhost:${port}`);
      io.on("connection", (socket) => {
        serverSocket = socket;
      });
      clientSocket.on("connect", done);
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.disconnect();
  });

  test("Powinien zostać utworzony pokój z jednym użytkownikiem", (done) => {
    const NICKNAME = "szymon";
    clientSocket.emit("create_room", NICKNAME);

    clientSocket.on("create_room__success", (user: User, room: Room) => {
      // user
      expect(user.socketId).toBeDefined();
      expect(user.roomId).toBeDefined();
      expect(user.nickname).toBe(NICKNAME);
      expect(user.ballColor).toBe("red");

      // room
      expect(room.player1).toBeDefined();
      expect(room.player2).toBe(1);
      expect(room.currentTurn).toBe(user.socketId);
    });
    done();
  });
});
