import { Button } from "@heroui/button";
import { BOARD_OFFSET, BOARD_WIDTH } from "../constants";
import { Room, User } from "../types";
import { Copy } from "lucide-react";

// type BottomBarProps = { room: Room | null; user: User };
type DefaultBottomBarProps = { room: Room; user: User };

// dolna listwa informacyjna
type BottomBarProps = DefaultBottomBarProps & { onStartNewGame: () => void };
export const BottomBar = (props: BottomBarProps) => {
  const { room, user } = props;

  return (
    <div
      className="h-[100px] mx-auto flex justify-between relative"
      style={{ width: BOARD_WIDTH - BOARD_OFFSET }}
    >
      <Triangle className="border-b-[100px] border-l-[100px] border-l-slate-200 rotate-[90deg]" />
      <div className="bg-slate-200 w-full flex justify-center gap-3 p-3">
        <PlayersInRoom room={room} user={user} />
        <VerticalLine />

        <GameStatus
          room={room}
          isCurrentPlayerTurn={room.currentTurn == user.socketId}
        />
        <VerticalLine />
        <BallColor currentBallColor={user.ballColor} />
      </div>
      <Triangle className="border-b-[100px] border-l-[100px] border-l-slate-200 rotate-[0deg]" />
      {room.status == "finished" && (
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
          <Button onPress={props.onStartNewGame} color="primary" size="lg">
            Rozpocznij nową rozgrywkę
          </Button>
        </div>
      )}
    </div>
  );
};

// trojkat ui
type TriangleProps = {
  className?: React.HTMLAttributes<HTMLDivElement>["className"];
};
const Triangle = (props: TriangleProps) => {
  return (
    <div
      className={`h-0 w-0 border-b-transparent ${props.className ? props.className : ""}`}
    ></div>
  );
};

// pionowa linia
const VerticalLine = () => {
  return <div className="h-full w-[2px] bg-slate-400"></div>;
};

// pojedynczy element z graczem w pokoju
type PlayerOnlineStatusProps = { user: User; isThisCurrentPlayer: boolean };
const PlayerOnlineStatus = (props: PlayerOnlineStatusProps) => {
  return (
    <div className="flex gap-3 items-center">
      <div className="h-2 w-2 rounded-full bg-green-300 border border-green-500"></div>
      <p className="text-sm">
        {props.user.nickname} {props.isThisCurrentPlayer && "(ty)"}
      </p>
    </div>
  );
};

// lista graczy w pokoju
const PlayersInRoom = (props: DefaultBottomBarProps) => {
  const { room, user } = props;

  return (
    <div>
      <h3 className="font-bold mb-1">Gracze w pokoju</h3>
      {room.player1 && (
        <PlayerOnlineStatus
          user={room.player1}
          isThisCurrentPlayer={room.player1.socketId == user.socketId}
        />
      )}
      {room.player2 && (
        <PlayerOnlineStatus
          user={room.player2}
          isThisCurrentPlayer={room.player2.socketId == user.socketId}
        />
      )}
    </div>
  );
};

// status rozgrywki
type GameStatusProps = { room: Room; isCurrentPlayerTurn: boolean };
const GameStatus = (props: GameStatusProps) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <p>
        {props.room.status === "finished" && "Koniec rozgrywki"}
        {props.room.status === "in_progress" && "Rozgrywka w toku"}
        {props.room.status === "waiting" && "Czekanie na przeciwnika..."}
      </p>
    </div>
  );
};

// informacja o kolorze kuli gracza
type BallColorProps = { currentBallColor: string };
const BallColor = (props: BallColorProps) => {
  return (
    <div>
      <div className="flex justify-center items-center gap-2">
        <p className="font-medium">Twój kolor bili:</p>
        <div
          className="h-5 w-5 border border-slate-300 rounded-full"
          style={{ backgroundColor: props.currentBallColor }}
        ></div>
      </div>
    </div>
  );
};

// element z kodem aktualnego pokoju
type RoomCodeProps = { room: Room };
export const RoomCode = (props: RoomCodeProps) => {
  return (
    <div className="fixed bottom-2 left-1/2 -translate-x-1/2 bg-slate-100 px-5 py-2 flex gap-2 items-center">
      <p className="font-bold">KOD POKOJU: </p>
      <p>{props.room.id}</p>
      <Button
        isIconOnly
        variant="light"
        onPress={() => navigator.clipboard.writeText(props.room.id)}
      >
        <Copy size={18} />
      </Button>
    </div>
  );
};

// gorna listwa informacyjna
type TopBarProps = { room: Room; isCurrentPlayerTurn: boolean };
export const TopBar = (props: TopBarProps) => {
  const { room } = props;

  const isPlayer1Won =
    room.player1 &&
    room.winnerSocketId &&
    room.winnerSocketId == room.player1.socketId;

  const isPlayer2Won =
    room.player2 &&
    room.winnerSocketId &&
    room.winnerSocketId == room.player2.socketId;

  return (
    <div className="h-[70px] w-[500px] mx-auto flex justify-between relative">
      <Triangle className="border-b-[70px] border-l-[70px] border-l-slate-200 rotate-[180deg]" />
      <div className="bg-slate-200 w-full flex flex-col items-center justify-center gap-1 p-3 text-lg">
        {room.status === "finished" ? (
          <>
            <p className="font-medium">Pojedynek zwyciężył</p>
            <p className="font-bold">
              {isPlayer1Won && room!.player1!.nickname}
              {isPlayer2Won && room!.player2!.nickname}
            </p>
          </>
        ) : (
          <>
            {props.room.status == "in_progress" && (
              <p className="font-bold">
                {props.isCurrentPlayerTurn
                  ? "TWOJA KOLEJ"
                  : "CZEKANIE NA RUCH PRZECIWNIKA"}
              </p>
            )}
          </>
        )}
      </div>
      <Triangle className="border-b-[70px] border-l-[70px] border-l-slate-200 rotate-[270deg]" />
    </div>
  );
};
