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
        <svg width="80" height="60" viewBox="-10 -10 80 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Body */}
          <motion.path
            d="M10 30 Q 15 15, 35 15 Q 50 15, 50 30"
            stroke={color}
            fill="var(--bg-primary)"
            strokeWidth="1.5"
            strokeLinecap="round"
            animate={state === 'relaxing' ? { d: "M10 35 Q 25 30, 45 30 Q 55 30, 55 35" } : {}}
          />
          
          {/* Head */}
          <motion.g
            animate={
              state === 'tilting' ? { rotate: [0, -15, 0] } : 
              state === 'relaxing' ? { y: 5, rotate: -10 } : 
              isGrooming ? { rotate: [0, 20, 0], x: [-2, 0, -2] } : {}
            }
            style={{ originX: '45px', originY: '20px' }}
          >
            <circle cx="45" cy="20" r="8" stroke={color} fill="var(--bg-primary)" strokeWidth="1.5" />
            {/* Ears */}
            <path d="M39 15 L37 8 L44 13" stroke={color} fill="var(--bg-primary)" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M51 15 L53 8 L46 13" stroke={color} fill="var(--bg-primary)" strokeWidth="1.5" strokeLinejoin="round" />
            {/* Eyes */}
            {!isBlinking ? (
              <>
                <circle cx="42" cy="19" r="1" fill={color} />
                <circle cx="48" cy="19" r="1" fill={color} />
              </>
            ) : (
              <>
                <line x1="41" y1="19" x2="43" y2="19" stroke={color} strokeWidth="1" />
                <line x1="47" y1="19" x2="49" y2="19" stroke={color} strokeWidth="1" />
              </>
            )}
            {/* Nose */}
            <path d="M44 22 L46 22" stroke={color} strokeWidth="1" />
          </motion.g>

          {/* Tail */}
          <motion.path
            d="M10 30 Q 5 25, 5 15"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            animate={{ 
              d: [
                "M10 30 Q 5 25, 5 15",
                "M10 30 Q 2 28, 0 20",
                "M10 30 Q 5 25, 5 15"
              ]
            }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          />

          {/* Legs */}
          {state !== 'relaxing' && (
            <>
              <motion.line 
                x1="15" y1="30" x2="15" y2="38" 
                stroke={color} strokeWidth="1.5" 
                animate={state === 'walking' ? { y2: [38, 34, 38], x2: [15, 18, 15] } : {}}
                transition={{ repeat: Infinity, duration: 0.6 }}
              />
              <motion.line 
                x1="25" y1="30" x2="25" y2="38" 
                stroke={color} strokeWidth="1.5" 
                animate={state === 'walking' ? { y2: [34, 38, 34], x2: [25, 22, 25] } : {}}
                transition={{ repeat: Infinity, duration: 0.6 }}
              />
              <motion.line 
                x1="35" y1="30" x2="35" y2="38" 
                stroke={color} strokeWidth="1.5" 
                animate={state === 'walking' ? { y2: [38, 34, 38], x2: [35, 38, 35] } : {}}
                transition={{ repeat: Infinity, duration: 0.6 }}
              />
              <motion.line 
                x1="45" y1="30" x2="45" y2="38" 
                stroke={color} strokeWidth="1.5" 
                animate={state === 'walking' ? { y2: [34, 38, 34], x2: [45, 42, 45] } : {}}
                transition={{ repeat: Infinity, duration: 0.6 }}
              />
            </>
          )}
        </svg>
      </div>
    </motion.div>
  );
}
