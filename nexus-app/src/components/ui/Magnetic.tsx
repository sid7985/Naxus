import { useRef, useState, ReactElement, MouseEvent } from 'react';
import { motion } from 'framer-motion';

interface MagneticProps {
  children: ReactElement;
  disabled?: boolean;
  intensity?: number;
}

export default function Magnetic({ children, disabled = false, intensity = 0.2 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: MouseEvent<HTMLDivElement>) => {
    if (disabled || !ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * intensity, y: middleY * intensity });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 350, damping: 15, mass: 0.1 }}
    >
      {children}
    </motion.div>
  );
}
