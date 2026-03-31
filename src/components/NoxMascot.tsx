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
        <svg width="100" height="80" viewBox="-10 -10 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Tail */}
          <motion.path
            d="M20 45 C 10 45, 5 40, 8 25"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            animate={{ 
              d: state === 'relaxing' 
                ? "M25 55 C 35 60, 55 60, 60 50" 
                : [
                    "M20 45 C 10 45, 5 40, 8 25",
                    "M20 45 C 5 45, 0 35, 5 20",
                    "M20 45 C 10 45, 5 40, 8 25"
                  ]
            }}
            transition={state === 'relaxing' ? { duration: 0.5 } : { repeat: Infinity, duration: 3, ease: "easeInOut" }}
          />

          {/* Body */}
          <motion.path
            d="M20 45 C 25 30, 50 30, 65 35"
            stroke={color}
            fill="var(--bg-primary)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={state === 'relaxing' ? { d: "M20 55 C 30 45, 55 45, 60 55" } : {}}
          />
          
          {/* Legs - Back */}
          {state !== 'relaxing' && (
            <>
              <motion.path 
                d="M25 42 L 22 55" 
                stroke={color} strokeWidth="2" strokeLinecap="round"
                animate={state === 'walking' ? { d: ["M25 42 L 22 55", "M25 42 L 30 52", "M25 42 L 22 55"] } : {}}
                transition={{ repeat: Infinity, duration: 0.8 }}
              />
              <motion.path 
                d="M35 40 L 38 55" 
                stroke={color} strokeWidth="2" strokeLinecap="round"
                animate={state === 'walking' ? { d: ["M35 40 L 38 55", "M35 40 L 32 52", "M35 40 L 38 55"] } : {}}
                transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
              />
            </>
          )}

          {/* Legs - Front */}
          {state !== 'relaxing' && (
            <>
              <motion.path 
                d="M55 38 L 52 55" 
                stroke={color} strokeWidth="2" strokeLinecap="round"
                animate={state === 'walking' ? { d: ["M55 38 L 52 55", "M55 38 L 58 52", "M55 38 L 52 55"] } : {}}
                transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
              />
              <motion.path 
                d="M62 36 L 65 55" 
                stroke={color} strokeWidth="2" strokeLinecap="round"
                animate={state === 'walking' ? { d: ["M62 36 L 65 55", "M62 36 L 60 52", "M62 36 L 65 55"] } : {}}
                transition={{ repeat: Infinity, duration: 0.8, delay: 0.6 }}
              />
            </>
          )}

          {/* Head Group */}
          <motion.g
            animate={
              state === 'tilting' ? { rotate: [0, -15, 0] } : 
              state === 'relaxing' ? { y: 15, x: -5, rotate: -5 } : 
              isGrooming ? { rotate: [0, 25, 0], x: [-3, 0, -3] } : {}
            }
            style={{ originX: '70px', originY: '30px' }}
          >
            {/* Head Shape */}
            <path
              d="M60 35 C 60 25, 80 25, 80 35 C 80 45, 60 45, 60 35"
              stroke={color}
              fill="var(--bg-primary)"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Ears */}
            <path d="M65 28 L 62 18 L 70 26" stroke={color} fill="var(--bg-primary)" strokeWidth="2" strokeLinejoin="round" />
            <path d="M75 28 L 78 18 L 70 26" stroke={color} fill="var(--bg-primary)" strokeWidth="2" strokeLinejoin="round" />
            
            {/* Eyes */}
            {!isBlinking ? (
              <>
                <circle cx="68" cy="34" r="1.5" fill={color} />
                <circle cx="76" cy="34" r="1.5" fill={color} />
              </>
            ) : (
              <>
                <line x1="66" y1="34" x2="70" y2="34" stroke={color} strokeWidth="1.5" />
                <line x1="74" y1="34" x2="78" y2="34" stroke={color} strokeWidth="1.5" />
              </>
            )}
            
            {/* Small Nose/Mouth area */}
            <path d="M71 38 C 72 39, 73 39, 74 38" stroke={color} strokeWidth="1" />
          </motion.g>
        </svg>
      </div>
    </motion.div>
  );
}
