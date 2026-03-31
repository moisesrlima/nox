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
          width="150" 
          height="100" 
          viewBox="-20 -20 271 192" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
          style={{ overflow: 'visible' }}
        >
          <motion.g 
            transform="translate(0, 152) scale(0.1, -0.1)" 
            fill={color}
            animate={
              state === 'tilting' ? { rotate: [0, -5, 0], x: [0, -2, 0] } : 
              state === 'relaxing' ? { scaleY: 0.9, y: 10 } : 
              isGrooming ? { x: [0, 5, 0] } : {}
            }
            style={{ originX: '2000px', originY: '1200px' }}
          >
            {/* Background fill to prevent transparency */}
            <ellipse cx="1150" cy="760" rx="1000" ry="600" fill="var(--bg-primary)" />
            <circle cx="2000" cy="1200" r="300" fill="var(--bg-primary)" />
            
            <path d="M1901 1293 c-21 -21 -42 -45 -47 -54 -10 -18 -155 -112 -197 -128 -47 -18 -248 -13 -379 10 -249 43 -437 41 -569 -7 -168 -60 -214 -109 -383 -403 -38 -65 -109 -147 -145 -165 -14 -8 -45 -17 -68 -21 -48 -8 -76 -34 -71 -66 7 -54 101 -64 193 -20 75 35 134 97 221 233 87 136 88 136 80 59 -9 -78 -31 -124 -85 -174 -31 -29 -45 -52 -61 -105 -48 -162 -53 -250 -15 -287 56 -57 132 -4 94 66 -8 15 -4 32 16 77 33 73 48 88 104 108 25 9 76 30 114 47 37 17 69 28 72 26 2 -3 -2 -28 -9 -57 -13 -46 -12 -55 5 -89 27 -54 137 -173 176 -189 18 -8 50 -14 72 -14 76 0 93 82 20 97 -37 7 -99 77 -99 111 0 14 18 48 39 76 22 28 47 68 57 89 18 37 21 39 54 33 19 -3 97 -6 173 -6 l137 0 0 -42 c-1 -24 -7 -79 -15 -123 -20 -109 -19 -168 3 -195 21 -25 89 -38 121 -21 27 15 27 52 1 76 -11 10 -20 24 -20 31 0 23 71 193 90 217 l18 22 88 -85 c49 -47 134 -128 189 -181 106 -103 142 -121 197 -100 49 19 45 84 -7 97 -46 11 -175 209 -195 297 -13 61 2 207 27 251 24 41 74 64 154 73 56 5 68 11 102 43 43 44 49 83 17 123 -11 14 -20 35 -20 47 0 30 -39 97 -67 115 -21 14 -23 21 -17 69 8 64 -4 76 -45 47 -36 -26 -39 -26 -43 1 -5 37 -35 33 -77 -9z m63 -47 c7 -52 9 -55 36 -54 30 1 93 -39 109 -70 4 -9 11 -33 15 -53 4 -21 16 -49 27 -63 11 -14 16 -26 10 -26 -7 0 -9 -10 -5 -24 4 -18 -1 -28 -21 -44 -26 -21 -41 -25 -138 -37 -56 -7 -112 -50 -134 -103 -7 -18 -16 -81 -19 -140 -6 -107 -6 -107 29 -177 52 -104 126 -206 175 -238 35 -23 41 -32 31 -43 -6 -8 -29 -14 -51 -14 -37 0 -47 8 -196 154 -260 255 -224 237 -509 247 -190 6 -409 25 -422 36 -2 1 8 12 22 24 15 11 27 25 27 30 0 20 -23 7 -73 -40 -74 -69 -157 -119 -266 -160 -107 -40 -127 -61 -158 -157 -14 -45 -14 -58 -4 -78 17 -31 7 -46 -30 -46 -45 0 -56 33 -41 123 25 144 49 205 102 256 54 52 74 104 85 226 3 38 14 89 25 112 10 23 15 45 10 48 -10 6 -24 -12 -40 -55 -7 -19 -25 -51 -39 -70 -15 -19 -57 -81 -94 -136 -101 -154 -177 -221 -268 -238 -47 -8 -89 7 -89 33 0 11 8 22 18 24 9 3 40 11 67 18 64 16 136 86 190 184 84 152 146 243 199 293 149 141 374 173 751 105 50 -9 149 -16 220 -17 117 -1 134 1 173 22 82 44 179 111 195 136 19 29 57 66 68 66 4 0 10 -24 13 -54z m76 4 c0 -23 -5 -30 -19 -30 -31 0 -37 21 -11 42 29 24 30 23 30 -12z m-1023 -699 c13 -7 2 -25 -80 -145 -34 -49 -34 -61 3 -119 22 -35 42 -53 75 -67 72 -31 54 -66 -27 -54 -32 6 -52 19 -100 70 -33 34 -71 79 -86 100 -23 35 -24 41 -14 81 7 24 12 56 12 71 1 19 11 35 38 55 34 26 41 28 102 21 36 -3 71 -9 77 -13z m526 -27 c23 -7 23 -9 -22 -105 -22 -46 -45 -103 -52 -127 -12 -42 -12 -44 16 -69 26 -25 27 -27 9 -40 -17 -12 -63 -10 -86 4 -13 7 -9 101 9 231 l17 124 45 -7 c25 -3 54 -8 64 -11z" />
            <path d="M2042 1048 c5 -34 38 -37 38 -4 0 20 -5 26 -21 26 -15 0 -20 -5 -17 -22z" />
          </motion.g>
        </svg>
      </div>
    </motion.div>
  );
}
