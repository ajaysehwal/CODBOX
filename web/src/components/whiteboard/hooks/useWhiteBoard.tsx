import { useAuth, useSocket } from "@/context";
import React, { useCallback, useEffect, useState } from "react";
import { useCanvasRef } from "./useCanvasRef";
import { useParams, useSearchParams } from "next/navigation";
import {
  Pencil,
  Eraser,
  Square,
  Circle,
  Type,
  Image as ImageIcon,
  Trash2,
  Download,
  PaintBucket,
  Undo,
  Redo,
} from "lucide-react";

interface DrawData {
  x: number;
  y: number;
  lastX: number;
  lastY: number;
  color: string;
  tool: string;
}
interface Point {
  x: number;
  y: number;
}
export const useWhiteBoard = () => {
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const { canvasRef } = useCanvasRef();
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [color, setColor] = useState<string>("#000000");
  const [activeTool, setActiveTool] = useState<string>("pencil");
  const { id: groupId } = useParams<{ id: string }>();

  const { socket } = useSocket();
  const { user } = useAuth();
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const context = canvas.getContext("2d");
    if (!context) return;
    context.strokeStyle = "black";
    context.lineWidth = 2;
    context.lineCap = "round";
    context.lineJoin = "round";

    if (socket && groupId) {
      socket.on("draw", (data: DrawData) => {
        drawOnCanvas(data.x, data.y, data.lastX, data.lastY, data.color);
      });
    }
    return () => {
      if (socket) {
        socket.off("draw");
      }
    };
  }, [canvasRef, color, socket]);

  const drawOnCanvas = useCallback(
    (
      x: number,
      y: number,
      lastX: number,
      lastY: number,
      strokeColor: string
    ) => {
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      if (context) {
        context.strokeStyle = strokeColor;
        context.beginPath();
        context.moveTo(lastX, lastY);
        context.lineTo(x, y);
        context.stroke();
      }
    },
    [canvasRef]
  );
  const getCanvasCoordinates = (
    event: React.MouseEvent<HTMLCanvasElement>
  ): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  };
  const startDrawing = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const { x, y } = getCanvasCoordinates(event);
      setIsDrawing(true);
      setLastPosition({ x, y });
    },
    [canvasRef]
  );
  const draw = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      drawOnCanvas(x, y, lastPosition.x, lastPosition.y, color);
      setLastPosition({ x, y });

      if (socket) {
        socket.emit("draw", {
          x,
          y,
          lastX: lastPosition.x,
          lastY: lastPosition.y,
          color: color,
          groupId,
          userId: user?.uid,
        });
      }
    },
    [isDrawing, lastPosition, color, socket, drawOnCanvas]
  );
  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);
  const handleToolChange = (toolName: string) => {
    setActiveTool(toolName);
  };
  const handleClear = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas) return;
    if (context) {
      context.clearRect(0, 0, canvas?.width, canvas?.height);
    }
    if (socket) {
      socket.emit("clear", groupId);
    }
  };
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = "whiteboard.png";
      link.href = dataUrl;
      link.click();
    }
  };
  const actionItems = [
    { icon: <Undo size={20} />, action: () => {}, tooltip: "Undo" },
    { icon: <Redo size={20} />, action: () => {}, tooltip: "Redo" },
    {
      icon: <Trash2 size={20} />,
      action: handleClear,
      tooltip: "Clear Canvas",
    },
    {
      icon: <Download size={20} />,
      action: handleDownload,
      tooltip: "Download",
    },
  ];
  const toolbarItems = [
    { icon: <Pencil size={20} />, tool: "pencil", tooltip: "Pencil" },
    { icon: <Eraser size={20} />, tool: "eraser", tooltip: "Eraser" },
    { icon: <Square size={20} />, tool: "rectangle", tooltip: "Rectangle" },
    { icon: <Circle size={20} />, tool: "circle", tooltip: "Circle" },
    { icon: <Type size={20} />, tool: "text", tooltip: "Text" },
    { icon: <PaintBucket size={20} />, tool: "fill", tooltip: "Fill" },
  ];
  return {
    toolbarItems,
    actionItems,
    startDrawing,
    draw,
    stopDrawing,
    canvasRef,
    activeTool,
    handleToolChange,
    color,
    setColor,
  };
};
