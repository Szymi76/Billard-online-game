import { useGame } from "@/useGame";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
import React, { useState } from "react";

// popover z funcjonalnoscia do tworzenia pokoju
export const CreateNewRoomPopover = () => {
  const { createRoom } = useGame();
  const [nickname, setNickname] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleCreateNewRoom = () => {
    const trimmedNickname = nickname.trim();
    if (trimmedNickname.length < 3) {
      setErrorMessage("Twoja nazwa musi mieć zo najmniej 3 znaki");
      return;
    }

    createRoom(trimmedNickname);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value);
    setErrorMessage("");
  };

  return (
    <Popover placement="bottom" showArrow={true}>
      <PopoverTrigger>
        <Button color="primary">Stwórz nowy pokój</Button>
      </PopoverTrigger>
      <PopoverContent className="bg-primary-100 max-w-80">
        <div className="p-2 flex flex-col gap-2">
          <h3 className="text-slate-700">
            Wypełnij poniższe pola, aby stworzyć nowy pokój.
          </h3>
          <Input
            value={nickname}
            onChange={handleChange}
            label="Twoja widoczna nazwa"
            size="sm"
            errorMessage={errorMessage}
            isInvalid={Boolean(errorMessage)}
            autoFocus
          />
          <Button color="primary" onPress={handleCreateNewRoom}>
            Stwórz
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

// popover z funkcjionalnoscia do dolaczania do pokoju
export const CreateJoinRoomPopover = () => {
  const { joinRoom } = useGame();
  const [nickname, setNickname] = useState({ value: "", errorMessage: "" });
  const [roomId, setRoomId] = useState({ value: "", errorMessage: "" });

  const handleJoinRoom = () => {
    const trimmedNickname = nickname.value.trim();
    if (trimmedNickname.length < 3) {
      const errorMessage = "Twoja nazwa musi mieć zo najmniej 3 znaki";
      setNickname({ ...nickname, errorMessage });
      return;
    }

    if (!roomId.value) {
      const errorMessage = "Wpisz kod pokoju";
      setRoomId({ ...roomId, errorMessage });
      return;
    }

    joinRoom(roomId.value, trimmedNickname);
  };

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickname({ value: e.target.value, errorMessage: "" });
  };

  const handleRoomIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoomId({ value: e.target.value, errorMessage: "" });
  };

  return (
    <Popover placement="bottom" showArrow={true}>
      <PopoverTrigger>
        <Button color="success">Dołącz do pokoju</Button>
      </PopoverTrigger>
      <PopoverContent className="bg-success-100 max-w-80">
        <div className="p-2 flex flex-col gap-2">
          <h3 className="text-slate-700">
            Wypełnij poniższe pola, aby dołączyć do pokoju.
          </h3>
          <Input
            value={nickname.value}
            onChange={handleNicknameChange}
            label="Twoja widoczna nazwa"
            size="sm"
            errorMessage={nickname.errorMessage}
            isInvalid={Boolean(nickname.errorMessage)}
            autoFocus
          />
          <Input
            value={roomId.value}
            onChange={handleRoomIdChange}
            label="Kod pokoju"
            size="sm"
            errorMessage={roomId.errorMessage}
            isInvalid={Boolean(roomId.errorMessage)}
          />
          <Button color="success" onPress={handleJoinRoom}>
            Dołącz
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
