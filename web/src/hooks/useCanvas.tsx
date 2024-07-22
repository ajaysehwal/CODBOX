import { useSocket } from "@/context";
import { useRef, useEffect, useState } from "react";
import { Socket } from "socket.io-client";

interface UseCanvasProps {
  roomId: string;
  socket: Socket | null;
}

interface DrawData {
  x: number;
  y: number;
  color: string;
  lineWidth: number;
  tool: "pencil" | "eraser";
}

interface CursorPosition {
  x: number;
  y: number;
  userId: string;
}

export const useCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(2);
  const [tool, setTool] = useState<"pencil" | "eraser">("pencil");
  const [cursors, setCursors] = useState<{ [key: string]: CursorPosition }>({});
  const socket = useSocket();
  useEffect(() => {
    if (!socket) return;

    socket.on("draw", (data: DrawData) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.strokeStyle = data.color;
      ctx.lineWidth = data.lineWidth;
      ctx.lineCap = "round";

      if (data.tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
      } else {
        ctx.globalCompositeOperation = "source-over";
      }

      ctx.lineTo(data.x, data.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(data.x, data.y);
    });

    socket.on("cursorMove", (data: CursorPosition) => {
      setCursors((prevCursors) => ({
        ...prevCursors,
        [data.userId]: data,
      }));
    });

    socket.on("userDisconnected", (userId: string) => {
      setCursors((prevCursors) => {
        const newCursors = { ...prevCursors };
        delete newCursors[userId];
        return newCursors;
      });
    });

    return () => {
      socket.off("draw");
      socket.off("cursorMove");
      socket.off("userDisconnected");
    };
  }, [socket]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";

    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
    } else {
      ctx.globalCompositeOperation = "source-over";
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);

    socket?.emit("draw", { x, y, color, lineWidth, tool, p: "" });
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket?.emit("clear", "");
  };

  const updateCursorPosition = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    socket?.emit("cursorMove", { x, y, p: "" });
  };

  return {
    canvasRef,
    isDrawing,
    color,
    lineWidth,
    tool,
    cursors,
    setColor,
    setLineWidth,
    setTool,
    startDrawing,
    stopDrawing,
    draw,
    clearCanvas,
    updateCursorPosition,
  };
};
