import { Navbar, NavbarContent, NavbarBrand, NavbarItem } from "@heroui/navbar";
import { Button } from "@heroui/button";
import { useGame } from "./useGame";
import { Board } from "./components/PoolComponents";
import { BottomBar, RoomCode, TopBar } from "./components/BoardUIComponents";
import { Github } from "lucide-react";
import { Link } from "@heroui/link";
import {
  CreateJoinRoomPopover,
  CreateNewRoomPopover,
} from "./components/NavbarPopovers";
import { Chat } from "./components/MessagesComponents";

const App = () => {
  const { room, leaveRoom, user, startNewGame, balls, sendMessage } = useGame();
  return (
    <>
      <Navbar isBordered className="bg-slate-100">
        <NavbarBrand className="font-bold text-2xl">BILARD ONLINE</NavbarBrand>
        <NavbarContent justify="end">
          <NavbarItem>{!room && <CreateJoinRoomPopover />}</NavbarItem>
          <NavbarItem>{!room && <CreateNewRoomPopover />}</NavbarItem>
          <NavbarItem>
            {room && (
              <Button onPress={leaveRoom} color="danger" variant="flat">
                Opuść pokój
              </Button>
            )}
          </NavbarItem>
        </NavbarContent>
      </Navbar>
      <main className="max-auto pt-12">
        {room && user && (
          <TopBar
            room={room}
            isCurrentPlayerTurn={room.currentTurn == user.socketId}
          />
        )}
        <Board balls={balls} />
        {room && user && (
          <BottomBar room={room} user={user} onStartNewGame={startNewGame} />
        )}
      </main>
      {room && <RoomCode room={room} />}
      <Button
        isIconOnly
        variant="bordered"
        as={Link}
        href="https://github.com/Szymi76/Billard-online-game"
        target="_blank"
        className="absolute right-2 bottom-2 border-black"
      >
        <Github color="black" />
      </Button>
      {room && <Chat onSend={sendMessage} room={room} />}
    </>
  );
};

export default App;
