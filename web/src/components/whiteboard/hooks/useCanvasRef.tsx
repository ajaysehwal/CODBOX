import React, { useRef } from "react";

export const useCanvasRef = () => {
  const undoRef = useRef<HTMLButtonElement>(null);
  const redoRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgRef = useRef<HTMLCanvasElement>(null);
  const minimapRef = useRef<HTMLCanvasElement>(null);
  const selectionRefs = useRef<HTMLButtonElement[]>([]);
  return {
    undoRef,
    redoRef,
    bgRef,
    canvasRef,
    minimapRef,
    selectionRefs,
  };
};
