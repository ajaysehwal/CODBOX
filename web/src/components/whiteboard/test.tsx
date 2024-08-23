"use client";
import React, { useEffect, useRef, useState } from "react";
import { INITIAL_COLOR, INITIAL_LINE_WIDTH } from "../constants";
import {
  drawRectangle,
  drawCircle,
  drawText,
  drawFreehand,
} from "./drawingFunctions";
import { Shape, Point, ShapeType, ToolType } from "../interface";
import ToolButton from "./ToolBarButton";
import {
  FaPencilAlt,
  FaEraser,
  FaSquare,
  FaCircle,
  FaTextHeight,
  FaUndo,
  FaRedo,
  FaTrash,
  FaExpand,
  FaCompress,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { Rnd } from "react-rnd";
import { useSocket } from "@/context";
import { useViewportSize } from "@/hooks/useViewportSize";
const Whiteboard: React.FC = () => {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [currentTool, setCurrentTool] = useState<ToolType>("pencil");
  const [color, setColor] = useState(INITIAL_COLOR);
  const [lineWidth, setLineWidth] = useState(INITIAL_LINE_WIDTH);
  const [selectedShape, setSelectedShape] = useState<number | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<Shape[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [isHost, setIsHost] = useState(false);
  const [dragging, setDragging] = useState<boolean>(true);
  const socket = useSocket();
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  // Effects
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

  useEffect(() => {
    drawShapes();
  }, [shapes]);
  useEffect(() => {
    if (socket) {
      socket.on("hostStatus", (status: boolean) => {
        console.log(status);
        setIsHost(status);
      });

      socket.on("updateShapes", (updatedShapes: Shape[]) => {
        setShapes(updatedShapes);
      });

      socket.on("updateCurrentTool", (tool: ToolType) => {
        setCurrentTool(tool);
      });

      socket.on("updateColor", (newColor: string) => {
        setColor(newColor);
      });

      socket.on("updateLineWidth", (width: number) => {
        setLineWidth(width);
      });
    }
    return () => {
      socket?.disconnect();
    };
  }, [socket]);

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

  const addToHistory = (newShapes: Shape[]) => {
    setShapes(newShapes);
    setHistory((prev) => [...prev.slice(0, historyIndex + 1), newShapes]);
    setHistoryIndex((prev) => prev + 1);
    if (socket && isHost) {
      socket.emit("updateShapes", newShapes);
    }
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

  const updateShape = (id: number, newProps: Partial<Shape>) => {
    const updatedShapes = shapes.map((shape) =>
      shape.id === id ? { ...shape, ...newProps } : shape
    );
    addToHistory(updatedShapes);
  };

  const handleTextChange = (id: number, text: string) => {
    const updatedShapes = shapes.map((shape) =>
      shape.id === id ? { ...shape, text } : shape
    );
    addToHistory(updatedShapes);
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

  const draw = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const { x, y } = getCanvasCoordinates(event);
    const updatedShapes = [...shapes];
    const currentShape = updatedShapes[updatedShapes.length - 1];
    if (currentShape.type === "freehand" && currentShape.points) {
      currentShape.points.push({ x, y });
      setShapes(updatedShapes);
      if (socket) {
        socket.emit("updateShapes", updatedShapes);
      }
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      addToHistory([...shapes]);
    }
  };

  const undo = () => {
    if (!isHost) return;
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
      const newShapes = history[historyIndex - 1];
      setShapes(newShapes);
      if (socket) {
        socket.emit("updateShapes", newShapes);
      }
    }
  };

  const redo = () => {
    if (!isHost) return;
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      const newShapes = history[historyIndex + 1];
      setShapes(newShapes);
      if (socket) {
        socket.emit("updateShapes", newShapes);
      }
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

  const handleToolChange = (tool: ToolType) => {
    if (!isHost) return;
    setCurrentTool(tool);
    if (socket) {
      socket.emit("updateCurrentTool", tool);
    }
  };

  const handleColorChange = (newColor: string) => {
    if (!isHost) return;
    setColor(newColor);
    if (socket) {
      socket.emit("updateColor", newColor);
    }
  };

  const handleLineWidthChange = (newWidth: number) => {
    if (!isHost) return;
    setLineWidth(newWidth);
    if (socket) {
      socket.emit("updateLineWidth", newWidth);
    }
  };
  const CANVAS_SIZE = {
    width: 3500,
    height: 2000,
  };
  const { width, height } = useViewportSize();
  return (
    <div className="flex w-full h-full bg-gray-100">
      <div className="flex flex-col h-full w-28 bg-[rgb(217,232,254)] text-white shadow-lg">
        <div className="flex-grow overflow-y-auto">
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <ToolButton
                icon={<FaPencilAlt />}
                onClick={() => handleToolChange("pencil")}
                active={currentTool === "pencil"}
                tooltip="Pencil"
              />
              <ToolButton
                icon={<FaEraser />}
                onClick={() => setCurrentTool("eraser")}
                active={currentTool === "eraser"}
                tooltip="Eraser"
              />
              <ToolButton
                icon={<FaSquare />}
                onClick={() => addShape("rectangle")}
                tooltip="Rectangle"
              />
              <ToolButton
                icon={<FaCircle />}
                onClick={() => addShape("circle")}
                tooltip="Circle"
              />
              <ToolButton
                icon={<FaTextHeight />}
                onClick={() => handleToolChange("text")}
                active={currentTool === "text"}
                tooltip="Text"
              />
              <ToolButton
                icon={<FaUndo />}
                onClick={undo}
                disabled={historyIndex <= 0}
                tooltip="Undo"
              />
              <ToolButton
                icon={<FaRedo />}
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                tooltip="Redo"
              />
              <ToolButton
                icon={<FaTrash />}
                onClick={clearCanvas}
                tooltip="Clear Canvas"
              />
            </div>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <ToolButton
                  icon={<FaExpand />}
                  onClick={() =>
                    selectedShape !== null &&
                    resizeShape(selectedShape, "increase")
                  }
                  disabled={selectedShape === null}
                  tooltip="Increase Size"
                />
                <ToolButton
                  icon={<FaCompress />}
                  onClick={() =>
                    selectedShape !== null &&
                    resizeShape(selectedShape, "decrease")
                  }
                  disabled={selectedShape === null}
                  tooltip="Decrease Size"
                />
              </div>
            </div>
            <div className="space-y-2">
              <input
                type="color"
                value={color}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-full h-10 rounded-md cursor-pointer"
              />
            </div>
            <div className="space-y-2">
              <input
                type="range"
                min="1"
                max="20"
                value={lineWidth}
                onChange={(e) => handleLineWidthChange(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex-grow bg-white rounded-lg relative">
        <motion.canvas
          ref={canvasRef}
          className="border-t-2 border-gray-200 bg-white cursor-crosshair w-full h-full"
          onClick={handleCanvasClick}
          drag={dragging}
          dragConstraints={{
            left: -(CANVAS_SIZE.width - width),
            right: 0,
            top: -(CANVAS_SIZE.height - height),
            bottom: 0,
          }}
          onMouseMove={draw}
          onMouseUp={(e) => {
            if (e.button === 2) setDragging(false);
          }}
          onMouseDown={(e) => {
            if (e.button === 2) {
              setDragging(true);
            } else {
              startDrawing(e);
            }
          }}
          onMouseLeave={stopDrawing}
        />
        {shapes.map(
          (shape) =>
            shape.type !== "freehand" && (
              <Rnd
                key={shape.id}
                size={{ width: shape.width, height: shape.height }}
                position={{ x: shape.x, y: shape.y }}
                onDragStop={(e, d) => updateShape(shape.id, { x: d.x, y: d.y })}
                onResizeStop={(e, direction, ref, delta, position) => {
                  updateShape(shape.id, {
                    width: parseInt(ref.style.width),
                    height: parseInt(ref.style.height),
                    ...position,
                  });
                }}
                className="absolute"
                bounds="parent"
              >
                <div
                  className={`w-full h-full flex items-center justify-center ${
                    shape.type === "circle" ? "rounded-full" : "rounded-md"
                  } `}
                >
                  {shape.type === "text" && (
                    <textarea
                      value={shape.text}
                      onChange={(e) =>
                        handleTextChange(shape.id, e.target.value)
                      }
                      className="w-full h-full bg-transparent resize-none outline-none text-center"
                      style={{ color: shape.color }}
                    />
                  )}
                </div>
              </Rnd>
            )
        )}
      </div>
    </div>
  );
};
export default Whiteboard;
