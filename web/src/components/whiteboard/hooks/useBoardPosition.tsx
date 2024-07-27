import { useMotionValue } from 'framer-motion';
import React from 'react'

export const useBoardPosition = () => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    return { x, y };
}
