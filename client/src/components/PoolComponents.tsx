import { useEffect, useRef, useState } from "react";
import { Ball, Hole } from "../types";
import { getPointFromAngle, normalizeAngle } from "../utils";
import { useGame } from "../useGame";
import {
  BALL_RADIUS,
  BOARD_HEIGHT,
  BOARD_OFFSET,
  BOARD_WIDTH,
  INITIAL_HOLES,
} from "../constants";
import PoolStickImage from "../assets/zoomed_pool_stick.png";
import PoolImage from "../assets/pool_table_1024x512.png";

// dziura do ktorej wpada kula
type PoolHoleProps = { hole: Hole };
export const PoolHole = (props: PoolHoleProps) => {
  return (
    <div
      className="absolute rounded-full"
      style={{
        top: props.hole.y - props.hole.radius,
        left: props.hole.x - props.hole.radius,
        width: props.hole.radius * 2,
        height: props.hole.radius * 2,
      }}
    ></div>
  );
};

// pasek na ktorym pokazana jest moc kija
type PowerBarProps = { power: number };
const PowerBar = (props: PowerBarProps) => {
  return (
    <div className="h-2 w-30 top-3 rounded-full border">
      <div
        className="bg-red-500 h-full"
        style={{ width: `${props.power}%` }}
      ></div>
    </div>
  );
};

// kij do uderzania bil
type PoolStickProps = {
  ball: Ball;
  rect: DOMRect | null;
};
const PoolStick = (props: PoolStickProps) => {
  const [pos, setPos] = useState({ x: 0, y: 0, angle: 0 });
  const [power, setPower] = useState(0);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const { strikeBall } = useGame();

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const newAngle =
        Math.atan2(
          event.clientY - props.rect?.top!,
          event.clientX - props.rect?.left!
        ) *
        (180 / Math.PI);
      const angle = normalizeAngle(newAngle);
      setPos({ ...getPointFromAngle(0, 0, newAngle, 70), angle });
    };

    const handleMouseDown = (event: MouseEvent) => {
      if (event.button == 2) {
        setIsMouseDown(false);
        setPower(0);
      } else setIsMouseDown(true);
    };

    const handleMouseUp = (event: MouseEvent) => {
      if (event.button == 2 || power == 0) return;

      setIsMouseDown(false);
      setPower(0);
      strikeBall(props.ball.id, normalizeAngle(pos.angle - 180), power);
    };

    const handleMenuContext = (event: MouseEvent) => {
      event.preventDefault();
    };

    const handleInterval = setInterval(() => {
      setPower((power) => {
        if (power < 100 && isMouseDown) return power + 5;
        return power;
      });
    }, 10);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("contextmenu", handleMenuContext);

    return () => {
      removeEventListener("mousemove", handleMouseMove);
      removeEventListener("mousedown", handleMouseDown);
      removeEventListener("mouseup", handleMouseUp);
      removeEventListener("contextmenu", handleMenuContext);
      clearInterval(handleInterval);
    };
  });

  return (
    <div
      className="absolute z-10"
      style={{
        transform: `rotate(${pos.angle}deg)`,
        transformOrigin: "0 0",
      }}
    >
      <div
        className="relative ml-16 duration-50"
        style={{ transform: `translateX(${isMouseDown ? power : -40}px)` }}
      >
        <div
          className="h-20 w-80 bg-no-repeat bg-contain absolute -top-2 left-0"
          style={{ backgroundImage: `url(${PoolStickImage})` }}
        ></div>
        {/* <PowerBar power={power} /> */}
      </div>
    </div>
  );
};

// kula bilardowa
type PoolBallProps = { ball: Ball };
export const PoolBall = (props: PoolBallProps) => {
  const { isEveryBallStill, room, user } = useGame();
  const ballRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const isCurrentUserTurn = room?.currentTurn == user?.socketId;

  useEffect(() => {
    if (!ballRef || !ballRef.current) return;
    const ballRect = ballRef.current?.getBoundingClientRect();
    setRect(ballRect);
  }, [props.ball]);

  if (props.ball.isPocketed) return <></>;

  const canStrike =
    isEveryBallStill() &&
    props.ball.canBeStrokeByPlayer &&
    isCurrentUserTurn &&
    room?.status == "in_progress";

  return (
    <div
      ref={ballRef}
      className="absolute"
      style={{ top: props.ball.y, left: props.ball.x }}
    >
      <div className="relative">
        {canStrike && <PoolStick rect={rect} ball={props.ball} />}
        <div
          className="border border-slate-500 rounded-full absolute inset-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            backgroundColor: props.ball.color,
            height: BALL_RADIUS * 2,
            width: BALL_RADIUS * 2,
          }}
        ></div>
      </div>
    </div>
  );
};

// caly stol bilardowy
type BoardProps = { balls: Ball[] };
export const Board = (props: BoardProps) => {
  return (
    <div
      className="bg-center bg-contain bg-no-repeat mx-auto flex justify-center items-center "
      style={{
        backgroundImage: `url(${PoolImage})`,
        width: BOARD_WIDTH + BOARD_OFFSET,
        height: BOARD_HEIGHT + BOARD_OFFSET,
      }}
    >
      <div
        className="relative box-content"
        style={{
          width: BOARD_WIDTH,
          height: BOARD_HEIGHT,
        }}
      >
        {props.balls.map((ball, index) => {
          return <PoolBall key={ball.id} ball={ball} />;
        })}
        {INITIAL_HOLES.map((hole, index) => {
          return <PoolHole key={`hole_${index}`} hole={hole} />;
        })}
      </div>
    </div>
  );
};
