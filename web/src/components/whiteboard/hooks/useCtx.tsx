import { useEffect, useState } from 'react';

import { useCanvasRef } from './useCanvasRef';

export const useCtx = () => {
  const { canvasRef } = useCanvasRef();

  const [ctx, setCtx] = useState<CanvasRenderingContext2D>();

  useEffect(() => {
    const newCtx = canvasRef.current?.getContext('2d');

    if (newCtx) {
      newCtx.lineJoin = 'round';
      newCtx.lineCap = 'round';
      setCtx(newCtx);
    }
  }, [canvasRef]);

  return ctx;
};
