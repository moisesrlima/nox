import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useDragControls, PanInfo } from 'motion/react';

interface NoxMascotProps {
  isVisible: boolean;
  onHide: () => void;
  color: string;
}

type MascotState = 'walking' | 'idle' | 'sitting' | 'relaxing' | 'tilting' | 'grooming' | 'leaving';

export function NoxMascot({ isVisible, onHide, color }: NoxMascotProps) {
  const [state, setState] = useState<MascotState>('walking');
  const [position, setPosition] = useState({ x: 100, y: 0 });
  const [direction, setDirection] = useState(1); // 1 for right, -1 for left
  const [isBlinking, setIsBlinking] = useState(false);
  const [isGrooming, setIsGrooming] = useState(false);
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());
  const dragControls = useDragControls();
  const containerRef = useRef<HTMLDivElement>(null);

  // Random blinking
  useEffect(() => {
    const blink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
      setTimeout(blink, 3000 + Math.random() * 5000);
    };
    const timer = setTimeout(blink, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Grooming animation loop
  useEffect(() => {
    if (state !== 'grooming') {
      setIsGrooming(false);
      return;
    }
    const interval = setInterval(() => {
      setIsGrooming(prev => !prev);
    }, 400);
    return () => clearInterval(interval);
  }, [state]);

  // Movement logic
  useEffect(() => {
    if (!isVisible || state === 'leaving' || state === 'relaxing' || state === 'sitting' || state === 'tilting' || state === 'grooming') return;

    const moveInterval = setInterval(() => {
      setPosition(prev => {
        const nextX = prev.x + (direction * 0.5);
        const margin = 50;
        const width = window.innerWidth;

        if (nextX > width - margin) {
          setDirection(-1);
          return { ...prev, x: width - margin };
        }
        if (nextX < margin) {
          setDirection(1);
          return { ...prev, x: margin };
        }
        return { ...prev, x: nextX };
      });

      // Randomly stop to sit or groom
      if (Math.random() < 0.005) {
        setState('sitting');
        setTimeout(() => setState('walking'), 3000 + Math.random() * 5000);
      }
    }, 50);

    return () => clearInterval(moveInterval);
  }, [isVisible, state, direction]);

  // Auto-hide logic
  useEffect(() => {
    if (!isVisible) return;

    const checkInactivity = setInterval(() => {
      const inactiveTime = Date.now() - lastInteractionTime;
      const timeout = 120000 + Math.random() * 120000; // 2 to 4 minutes

      if (inactiveTime > timeout && state !== 'leaving') {
        setState('leaving');
        // Walk to edge
        const targetX = direction === 1 ? window.innerWidth + 100 : -100;
        
        // We'll let the animation handle the walk to edge
        setTimeout(() => {
          onHide();
          setState('walking'); // Reset for next time
        }, 5000);
      }
    }, 10000);

    return () => clearInterval(checkInactivity);
  }, [isVisible, lastInteractionTime, state, direction, onHide]);

  const handleInteraction = () => {
    setLastInteractionTime(Date.now());
  };

  const handleClick = () => {
    handleInteraction();
    if (state === 'walking' || state === 'sitting') {
      setState('tilting');
      setTimeout(() => setState('walking'), 2000);
    }
  };

  const handleDoubleClick = () => {
    handleInteraction();
    setState('relaxing');
    setTimeout(() => setState('walking'), 8000);
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    handleInteraction();
    setPosition(prev => ({ 
      x: prev.x + info.offset.x, 
      y: Math.min(0, prev.y + info.offset.y) // Keep it at or above bottom
    }));
    setState('grooming');
    setTimeout(() => setState('walking'), 4000);
  };

  if (!isVisible && state !== 'leaving') return null;

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: state === 'leaving' ? 0 : 1, 
        y: position.y,
        x: state === 'leaving' ? (direction === 1 ? window.innerWidth + 100 : -100) : position.x
      }}
      transition={{ 
        opacity: { duration: 1 },
        x: state === 'leaving' ? { duration: 5, ease: "linear" } : { duration: 0.05, ease: "linear" },
        y: { duration: 0.3 }
      }}
      style={{
        position: 'fixed',
        bottom: '20px',
        left: 0,
        zIndex: 100,
        cursor: 'grab',
        pointerEvents: 'auto',
      }}
      drag
      dragConstraints={{ left: 0, right: window.innerWidth, bottom: 0, top: -window.innerHeight + 100 }}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className="hidden md:block" // Desktop only
    >
      <div style={{ transform: `scaleX(${direction})`, transition: 'transform 0.3s' }}>
        <svg 
          width="160" 
          height="120" 
          viewBox="0 0 240 160" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
          style={{ overflow: 'visible' }}
        >
          {/* Main Body Group */}
          <motion.g
            animate={
              state === 'tilting' ? { rotate: [0, -8, 0], x: [0, -2, 0] } : 
              state === 'relaxing' ? { scaleY: 0.85, y: 15 } : 
              isGrooming ? { x: [0, 4, 0], rotate: [0, 2, 0] } : 
              state === 'walking' ? { y: [0, -2, 0] } : {}
            }
            transition={state === 'walking' ? { repeat: Infinity, duration: 0.4 } : {}}
            style={{ originX: '120px', originY: '80px' }}
          >
            {/* The Silhouette Fill (Solid Background) */}
            <path
              d="M185 55 C195 55 205 65 205 80 C205 95 195 105 180 110 C160 115 120 120 100 115 C80 115 60 110 50 95 C40 80 40 65 50 55 C70 45 120 40 185 55 Z"
              fill="var(--bg-primary)"
            />
            
            {/* The Continuous Line Art Outline */}
            <motion.path
              d="M175 45 L182 25 L190 45 M195 48 L202 28 L210 48 
                 M210 48 C220 52 225 60 225 75 C225 85 215 95 205 100 C190 105 175 105 175 105
                 L175 135 M160 105 L160 135
                 M175 105 C140 115 100 115 85 105
                 L75 135 M95 105 L105 135
                 M85 105 C65 105 50 95 45 80 C40 65 45 55 60 45
                 C90 35 140 35 175 45
                 M45 80 C30 80 20 70 20 50 C20 30 40 30 50 50"
              stroke={color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="var(--bg-primary)"
              animate={state === 'walking' ? {
                d: [
                  "M175 45 L182 25 L190 45 M195 48 L202 28 L210 48 M210 48 C220 52 225 60 225 75 C225 85 215 95 205 100 C190 105 175 105 175 105 L175 135 M160 105 L160 135 M175 105 C140 115 100 115 85 105 L75 135 M95 105 L105 135 M85 105 C65 105 50 95 45 80 C40 65 45 55 60 45 C90 35 140 35 175 45 M45 80 C30 80 20 70 20 50 C20 30 40 30 50 50",
                  "M175 45 L182 25 L190 45 M195 48 L202 28 L210 48 M210 48 C220 52 225 60 225 75 C225 85 215 95 205 100 C190 105 175 105 175 105 L185 130 M160 105 L150 135 M175 105 C140 115 100 115 85 105 L85 130 M95 105 L95 135 M85 105 C65 105 50 95 45 80 C40 65 45 55 60 45 C90 35 140 35 175 45 M45 80 C30 80 20 70 20 50 C20 30 40 30 50 50",
                  "M175 45 L182 25 L190 45 M195 48 L202 28 L210 48 M210 48 C220 52 225 60 225 75 C225 85 215 95 205 100 C190 105 175 105 175 105 L175 135 M160 105 L160 135 M175 105 C140 115 100 115 85 105 L75 135 M95 105 L105 135 M85 105 C65 105 50 95 45 80 C40 65 45 55 60 45 C90 35 140 35 175 45 M45 80 C30 80 20 70 20 50 C20 30 40 30 50 50"
                ]
              } : {}}
              transition={{ repeat: Infinity, duration: 0.8 }}
            />

            {/* The Eye (Precise Black Dot) */}
            <motion.circle
              cx="205"
              cy="70"
              r="2"
              fill={color}
              animate={isBlinking ? { scaleY: 0.1 } : { scaleY: 1 }}
            />
          </motion.g>
        </svg>
      </div>
    </motion.div>
  );
}
