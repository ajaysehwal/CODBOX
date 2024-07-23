import { useState, useEffect } from 'react';

export const useMousePosition = (ref: React.RefObject<HTMLElement>) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = (ev: MouseEvent) => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        setMousePosition({ x: ev.clientX - rect.left, y: ev.clientY - rect.top });
      }
    };

    ref.current?.addEventListener('mousemove', updateMousePosition);

    return () => {
      ref.current?.removeEventListener('mousemove', updateMousePosition);
    };
  }, [ref]);

  return mousePosition;
};