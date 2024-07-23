type ShapeType = "rectangle" | "circle" | "text" | "freehand";
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

import { useState } from "react";
export const useBoardTools = () => {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [history, setHistory] = useState<Shape[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isDrawing, setIsDrawing] = useState(false);

  const addToHistory = (newShapes: Shape[]) => {
    setShapes(newShapes);
    setHistory((prev) => [...prev.slice(0, historyIndex + 1), newShapes]);
    setHistoryIndex((prev) => prev + 1);
  };
  const drawRectangle = (ctx: CanvasRenderingContext2D, shape: Shape) => {
    ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
    if (shape.text) {
      drawShapeText(ctx, shape);
    }
  };
  const drawCircle = (ctx: CanvasRenderingContext2D, shape: Shape) => {
    ctx.beginPath();
    ctx.arc(
      shape.x + shape.width / 2,
      shape.y + shape.height / 2,
      shape.width / 2,
      0,
      2 * Math.PI
    );
    ctx.stroke();
    if (shape.text) {
      drawShapeText(ctx, shape);
    }
  };
  const drawText = (ctx: CanvasRenderingContext2D, shape: Shape) => {
    ctx.font = "16px Arial";
    ctx.fillStyle = shape.color;
    ctx.fillText(shape.text || "", shape.x, shape.y + 20);
  };
  const drawFreehand = (ctx: CanvasRenderingContext2D, shape: Shape) => {
    if (shape.points) {
      ctx.beginPath();
      ctx.moveTo(shape.points[0].x, shape.points[0].y);
      shape.points.forEach((point) => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    }
  };
  const drawShapeText = (ctx: CanvasRenderingContext2D, shape: Shape) => {
    ctx.font = "14px Arial";
    ctx.fillStyle = shape.color;
    const textWidth = ctx.measureText(shape.text || "").width;
    const textX = shape.x + (shape.width - textWidth) / 2;
    const textY = shape.y + shape.height / 2;
    ctx.fillText(shape.text || "", textX, textY);
  };
  const updateShape = (id: number, newProps: Partial<Shape>) => {
    const updatedShapes = shapes.map((shape) =>
      shape.id === id ? { ...shape, ...newProps } : shape
    );
    addToHistory(updatedShapes);
  };
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
      setShapes(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      setShapes(history[historyIndex + 1]);
    }
  };
  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      addToHistory([...shapes]);
    }
  };

  const clearCanvas = () => {
    addToHistory([]);
  };
  const resizeShape = (id: number, direction: "increase" | "decrease") => {
    const updatedShapes = shapes.map((shape) => {
      if (shape.id === id) {
        const scale = direction === "increase" ? 1.1 : 0.9;
        return {
          ...shape,
          width: shape.width * scale,
          height: shape.height * scale,
        };
      }
      return shape;
    });
    addToHistory(updatedShapes);
  };
  return {
    addToHistory,
    drawRectangle,
    drawCircle,
    drawText,
    drawFreehand,
    drawShapeText,
    updateShape,
    undo,
    redo,
    clearCanvas,
    resizeShape,
    shapes,
    historyIndex,
    history,
    isDrawing,
    setIsDrawing,
    stopDrawing,
    setShapes,
  };
};
