import { Room } from "@/types";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { MessageSquare, MessageSquareOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type ChatBoxProps = { onSend: (text: string) => void };
const ChatBox = (props: ChatBoxProps) => {
  const [text, setText] = useState("");

  const handleSend = (e: React.MouseEvent<HTMLFormElement, MouseEvent>) => {
    e.preventDefault();
    const trimmedText = text.trim();
    if (trimmedText.length <= 0) return;

    props.onSend(trimmedText);
  };

  return (
    <form onSubmit={handleSend} className="flex gap-1 p-2">
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        color="primary"
      />
      <Button type="submit" color="primary">
        Wyslij
      </Button>
    </form>
  );
};

type ChatMessagesProps = { room: Room };
const ChatMessages = (props: ChatMessagesProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref || !ref.current) return;
    ref.current.scrollBy({ top: 50 });
  }, [props.room.messages]);

  return (
    <div ref={ref} className="p-2 max-h-[300px] overflow-y-scroll">
      {props.room.messages.map((message) => {
        return (
          <div className="flex gap-1">
            <p>{message.author.nickname}: </p>
            <p>{message.text}</p>
          </div>
        );
      })}
    </div>
  );
};

type ChatProps = { room: Room; onSend: (text: string) => void };
export const Chat = (props: ChatProps) => {
  const [showChat, setShowChat] = useState(true);

  if (!showChat) {
    return (
      <Button
        onPress={() => setShowChat(true)}
        isIconOnly
        color="primary"
        className="absolute right-2 bottom-16"
      >
        <MessageSquare />
      </Button>
    );
  }

  return (
    <div className="bg-slate-100 absolute right-2 bottom-16 rounded">
      <ChatMessages room={props.room} />
      <div className="flex items-center pr-2">
        <ChatBox onSend={props.onSend} />
        <Button
          onPress={() => setShowChat(false)}
          isIconOnly
          className="hover:bg-danger"
        >
          <MessageSquareOff />
        </Button>
      </div>
    </div>
  );
};
