"use client";
import React, { useState, useRef, useEffect } from "react";
import { useBoardTools } from "./useBoardTools";
const INITIAL_COLOR = "#111111";
const INITIAL_LINE_WIDTH = 5;
type ShapeType = "rectangle" | "circle" | "text" | "freehand";
type ToolType =
  | "pencil"
  | "eraser"
  | "rectangle"
  | "circle"
  | "text"
  | "select";
interface Point {
  x: number;
  y: number;
}
interface Shape {
  id: number;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  text?: string;
  points?: Point[];
}
export const useWhiteBoard = () => {
  const [currentTool, setCurrentTool] = useState<ToolType>("pencil");
  const [color, setColor] = useState(INITIAL_COLOR);
  const [lineWidth, setLineWidth] = useState(INITIAL_LINE_WIDTH);
  const [selectedShape, setSelectedShape] = useState<number | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const {
    drawCircle,
    drawFreehand,
    drawRectangle,
    addToHistory,
    drawText,
    shapes,
    resizeShape,
    setShapes,
    stopDrawing,
    updateShape,
    isDrawing,
    setIsDrawing
  } = useBoardTools();
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const parent = canvas.parentElement;
        if (parent) {
          setCanvasSize({
            width: parent.clientWidth,
            height: parent.clientHeight,
          });
        }
      }
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
    };
  }, []);
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;
      const context = canvas.getContext("2d");
      if (context) {
        context.lineCap = "round";
        context.strokeStyle = color;
        context.lineWidth = lineWidth;
        contextRef.current = context;
      }
    }
  }, [color, lineWidth, canvasSize]);
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
  const drawShapes = () => {
    if (contextRef.current) {
      const ctx = contextRef.current;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      shapes.forEach((shape) => {
        ctx.strokeStyle = shape.color;
        ctx.lineWidth = lineWidth;

        switch (shape.type) {
          case "rectangle":
            drawRectangle(ctx, shape);
            break;
          case "circle":
            drawCircle(ctx, shape);
            break;
          case "text":
            drawText(ctx, shape);
            break;
          case "freehand":
            drawFreehand(ctx, shape);
            break;
        }
      });
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool === "text") {
      const { x, y } = getCanvasCoordinates(event);
      const newShape: Shape = {
        id: shapes.length,
        type: "text",
        x,
        y,
        width: 200,
        height: 50,
        color,
        text: "Your text here",
      };
      addToHistory([...shapes, newShape]);
    }
  };
  const draw = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const { x, y } = getCanvasCoordinates(event);
    const updatedShapes = [...shapes];
    const currentShape = updatedShapes[updatedShapes.length - 1];
    if (currentShape.type === "freehand" && currentShape.points) {
      currentShape.points.push({ x, y });
      setShapes(updatedShapes);
    }
  };

  const addShape = (type: ShapeType) => {
    const newShape: Shape = {
      id: shapes.length,
      type,
      x: 50,
      y: 50,
      width: type === "text" ? 200 : 100,
      height: type === "text" ? 50 : 100,
      color,
      text: "",
    };
    addToHistory([...shapes, newShape]);
  };

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool === "pencil" || currentTool === "eraser") {
      setIsDrawing(true);
      const { x, y } = getCanvasCoordinates(event);
      const newShape: Shape = {
        id: shapes.length,
        type: "freehand",
        x,
        y,
        width: 0,
        height: 0,
        color: currentTool === "eraser" ? "#FFFFFF" : color,
        points: [{ x, y }],
      };
      setShapes([...shapes, newShape]);
    }
  };

  useEffect(() => {
    drawShapes();
  }, [shapes]);
  const handleTextChange = (id: number, text: string) => {
    const updatedShapes = shapes.map((shape) =>
      shape.id === id ? { ...shape, text } : shape
    );
    addToHistory(updatedShapes);
  };

  return {
    setCurrentTool,
    resizeShape,
    setColor,
    setLineWidth,
    handleCanvasClick,
    startDrawing,
    addShape,
    draw,
    stopDrawing,
    selectedShape,
    shapes,
    updateShape,
    color,
    canvasRef,
    lineWidth,
    handleTextChange,
    currentTool,
  };
};
