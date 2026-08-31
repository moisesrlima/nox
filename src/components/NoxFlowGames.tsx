import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Sparkles,
  RotateCcw,
  Info,
  Wind,
  X,
  Maximize2,
  Minimize2,
  Heart,
} from 'lucide-react';

interface NoxFlowGamesProps {
  isBreak: boolean;
}

/**
 * Pausa Serena — bolhas meditativas com fases e vidas.
 *
 * Versão 2:
 *   - Bolhas spawnam em todo o ecrã (modo overlay full-screen opcional).
 *   - Cada bolha que escapa ao topo custa 1 vida. 5 vidas → game over.
 *   - Fases incrementais: a cada N pontos, a velocidade e o spawn-rate
 *     aumentam, e o tom das bolhas muda (calmo → quente → energético).
 *   - Pontuação por bolha estourada (com bónus por fase).
 *   - Modo Respiração mantém-se como bónus opcional, independente da fase.
 */
export function NoxFlowGames({ isBreak }: NoxFlowGamesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const bubblesRef = useRef<Bubble[]>([]);
  const lastSpawnRef = useRef<number>(0);
  const phaseStartRef = useRef<number>(performance.now());
  const startTimeRef = useRef<number>(performance.now());

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [phase, setPhase] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'gameover'>('playing');
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('noxflow_bubble_highscore');
    return saved ? parseInt(saved, 10) || 0 : 0;
  });
  const [showInfo, setShowInfo] = useState(true);
  const [isBreathing, setIsBreathing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Phase configuration (5 phases).
  const PHASES = [
    { name: 'Calma',   minScore: 0,   riseMul: 1.0, spawnMs: 1500, hueBase: 200 },
    { name: 'Suave',   minScore: 10,  riseMul: 1.3, spawnMs: 1250, hueBase: 210 },
    { name: 'Ativa',   minScore: 30,  riseMul: 1.6, spawnMs: 1050, hueBase: 280 },
    { name: 'Energia', minScore: 60,  riseMul: 2.0, spawnMs: 850,  hueBase: 320 },
    { name: 'Fluxo',   minScore: 100, riseMul: 2.5, spawnMs: 650,  hueBase: 30  },
  ];

  const currentPhase = PHASES[Math.min(phase, PHASES.length - 1)];

  // Promote to next phase when score crosses a threshold.
  useEffect(() => {
    const nextPhase = PHASES.findIndex(
      (p) => p.minScore > score,
    );
    if (nextPhase === -1) return;
    if (score >= PHASES[nextPhase].minScore && nextPhase > phase) {
      setPhase(nextPhase);
    }
  }, [score, phase]);

  // Game over handler.
  useEffect(() => {
    if (lives <= 0 && gameState === 'playing') {
      setGameState('gameover');
      setHighScore((prev) => {
        const next = Math.max(prev, score);
        localStorage.setItem('noxflow_bubble_highscore', String(next));
        return next;
      });
    }
  }, [lives, score, gameState]);

  const reset = () => {
    bubblesRef.current = [];
    setScore(0);
    setLives(5);
    setPhase(0);
    setGameState('playing');
    lastSpawnRef.current = performance.now();
    startTimeRef.current = performance.now();
  };

  // Lock body scroll when expanded.
  useEffect(() => {
    if (!isExpanded) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isExpanded]);

  // Listen for Escape to close overlay.
  useEffect(() => {
    if (!isExpanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsExpanded(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isExpanded]);

  // Render loop: spawn bubbles, animate, draw, detect escapes.
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = isExpanded ? overlayContainerRef.current : containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const { width, height } = container.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const draw = (now: number) => {
      const { width, height } = container.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);

      const phaseConfig = PHASES[Math.min(phase, PHASES.length - 1)];

      // Spawn: only when playing.
      if (gameState === 'playing' && now - lastSpawnRef.current > phaseConfig.spawnMs) {
        lastSpawnRef.current = now;
        bubblesRef.current.push(
          makeBubble(width, height, phaseConfig.hueBase),
        );
      }

      const remaining: Bubble[] = [];
      let escaped = 0;
      for (const b of bubblesRef.current) {
        b.t = (now - b.born) / b.lifeMs;
        if (b.popped) {
          b.popT = (now - b.poppedAt) / 600;
          if (b.popT >= 1) continue;
        } else {
          // Progressive acceleration within session (1.0 → 1.25 over 120s).
          const elapsedSec = (now - startTimeRef.current) / 1000;
          const accel = 1 + Math.min(0.25, elapsedSec / 120);
          // Single combined velocity formula (fixes previous double-counting bug).
          b.y -= b.riseSpeed * phaseConfig.riseMul * accel;
          b.x += Math.sin((now - b.born) / 700) * 0.2;

          // Check if escaped (top of viewport).
          if (b.y < -b.r) {
            escaped++;
            continue;
          }
        }
        remaining.push(b);
        drawBubble(ctx, b);
      }
      bubblesRef.current = remaining;

      // Apply escaped lives (only when playing).
      if (escaped > 0 && gameState === 'playing') {
        setLives((l) => Math.max(0, l - escaped));
      }

      // Breath guide (only in overlay and when active).
      if (isExpanded && isBreathing) {
        drawBreathGuide(ctx, width, height, now, phaseStartRef.current);
      }

      // Game over overlay message.
      if (gameState === 'gameover') {
        drawGameOver(ctx, width, height, score);
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [phase, gameState, isBreathing, isExpanded]);

  // Click handler: pop bubble (and pause game if game over).
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (gameState !== 'playing') return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      for (let i = bubblesRef.current.length - 1; i >= 0; i--) {
        const b = bubblesRef.current[i];
        if (b.popped) continue;
        const dx = x - b.x;
        const dy = y - b.y;
        if (dx * dx + dy * dy <= b.r * b.r) {
          b.popped = true;
          b.poppedAt = performance.now();
          // Score by phase.
          setScore((s) => s + 1 + phase);
          return;
        }
      }

      // Click outside bubbles (overlay only): sync breathing phase.
      if (isExpanded && isBreathing) {
        phaseStartRef.current = performance.now();
      }
    },
    [gameState, phase, isBreathing, isExpanded],
  );

  // ----- HUD (shared between panel + overlay) -----
  const hud = (
    <div className="flex items-center gap-3 px-4 py-2 bg-[var(--bg-surface)]/80 backdrop-blur rounded-xl border border-[var(--border-color)] shadow-sm text-xs">
      <div className="flex items-center gap-1.5 font-bold text-[var(--text-primary)]">
        <Sparkles className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
        <span>{score}</span>
      </div>
      <div className="w-px h-3 bg-[var(--border-color)]" />
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Heart
            key={i}
            className={`w-3.5 h-3.5 transition-colors ${
              i < lives
                ? 'text-rose-500 fill-rose-500'
                : 'text-[var(--text-muted)]'
            }`}
          />
        ))}
      </div>
      <div className="w-px h-3 bg-[var(--border-color)]" />
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Fase</span>
        <span className="font-bold text-[var(--text-primary)]">{currentPhase.name}</span>
      </div>
    </div>
  );

  // ----- Canvas (used in both panel and overlay) -----
  const canvas = (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      className="absolute inset-0 w-full h-full cursor-pointer select-none touch-none"
      aria-label="Bolhas serenas: clique para libertar uma bolha antes que chegue ao topo"
      role="img"
    />
  );

  // ----- Panel mode (compact, embedded in parent) -----
  if (!isExpanded) {
    return (
      <div className="bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm h-full flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[var(--accent-primary)]" />
            Pausa Serena
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={reset} className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors" title="Reiniciar">
              <RotateCcw className="w-4 h-4" />
            </button>
            <button onClick={() => setShowInfo((v) => !v)} className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors" title="Como funciona">
              <Info className="w-4 h-4" />
            </button>
            <button onClick={() => setIsExpanded(true)} className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors" title="Expandir para tela cheia">
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {showInfo && (
          <div className="bg-[var(--bg-primary)] p-3 rounded-xl text-xs text-[var(--text-secondary)] mb-4 border border-[var(--border-color)]">
            <p className="font-bold mb-1 text-[var(--text-primary)]">Como funciona:</p>
            <p>
              Estoure bolhas antes que cheguem ao cimo — tem <strong>5 vidas</strong>.
              A velocidade aumenta por fases: Calma → Suave → Ativa → Energia → Fluxo.
              Expande para tela cheia para uma experiência imersiva.
            </p>
          </div>
        )}

        <div className="flex-1 flex flex-col gap-3">
          <div className="flex items-center justify-between">{hud}</div>
          <div
            ref={containerRef}
            className="relative flex-1 min-h-[280px] rounded-2xl overflow-hidden border border-[var(--border-color)] bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-surface)] to-[var(--bg-primary)]"
          >
            {canvas}
          </div>
          <p className="text-[11px] text-[var(--text-muted)] text-center italic">
            Sem pontuação perfeita — apenas a sua presença.
          </p>
        </div>
      </div>
    );
  }

  // ----- Overlay mode (fixed full-screen) -----
  return (
    <div
      ref={overlayContainerRef}
      className="fixed inset-0 z-[9999]"
      role="dialog"
      aria-modal="true"
      aria-label="Pausa Serena em tela cheia"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-primary)]/95 via-[var(--bg-surface)]/95 to-[var(--bg-primary)]/95 backdrop-blur-sm">
        {canvas}
      </div>

      <div className="absolute top-4 right-4 flex flex-col items-end gap-3">
        <div>{hud}</div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBreathing((b) => !b)}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
              isBreathing
                ? 'bg-[var(--accent-primary)] text-[var(--accent-contrast)]'
                : 'bg-[var(--bg-surface)]/80 backdrop-blur text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)]'
            }`}
            title="Guia de respiração 4-6"
          >
            <Wind className="w-3.5 h-3.5 inline-block mr-1" />
            {isBreathing ? 'Respirando' : 'Respirar'}
          </button>
          <button
            onClick={reset}
            className="p-2 rounded-md bg-[var(--bg-surface)]/80 backdrop-blur text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] transition-colors"
            title="Reiniciar"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsExpanded(false)}
            className="p-2 rounded-md bg-[var(--bg-surface)]/80 backdrop-blur text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] transition-colors"
            title="Sair (Esc)"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider bg-[var(--bg-surface)]/70 backdrop-blur px-3 py-1.5 rounded-md border border-[var(--border-color)]">
        Recorde: {highScore}
      </div>

      {/* Helper for screen-readers only. */}
      <p className="sr-only">
        Estoure as bolhas antes que cheguem ao cimo. Tem 5 vidas. Use Esc para sair.
      </p>
    </div>
  );
}

// ---------- Helpers ----------

interface Bubble {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  hue: number;
  alpha: number;
  born: number;
  lifeMs: number;
  riseSpeed: number;
  t: number;
  popped: boolean;
  poppedAt: number;
  popT: number;
}

function makeBubble(canvasW: number, canvasH: number, hueBase: number): Bubble {
  // Spawn anywhere along the bottom (or full width, slightly off-screen).
  const baseR = 22 + Math.random() * 26;
  return {
    x: 40 + Math.random() * Math.max(80, canvasW - 80),
    y: canvasH + baseR + Math.random() * 60,
    r: baseR,
    vx: 0,
    vy: 0,
    hue: hueBase + (Math.random() * 40 - 20),
    alpha: 0.18 + Math.random() * 0.18,
    born: performance.now(),
    // Long enough to traverse any viewport, even at peak speed
    // (riseSpeed~0.4 * riseMul 2.5 * accel 1.25 ≈ 1.25 px/frame @ 60fps = 75 px/s).
    lifeMs: 35000 + Math.random() * 10000, // 35-45s
    riseSpeed: 0.18 + Math.random() * 0.22,
    t: 0,
    popped: false,
    poppedAt: 0,
    popT: 0,
  };
}

function drawBubble(ctx: CanvasRenderingContext2D, b: Bubble) {
  ctx.save();
  const scale = b.popped ? 1 + b.popT * 0.6 : 1;
  const alpha = b.popped
    ? Math.max(0, 1 - b.popT) * b.alpha
    : b.alpha * (1 - b.t * 0.4);

  const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * scale);
  grad.addColorStop(0, `hsla(${b.hue}, 80%, 75%, ${alpha})`);
  grad.addColorStop(0.5, `hsla(${b.hue}, 70%, 65%, ${alpha * 0.5})`);
  grad.addColorStop(1, `hsla(${b.hue}, 60%, 55%, 0)`);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.r * scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = `hsla(${b.hue}, 80%, 90%, ${alpha * 0.6})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.r * scale, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = `hsla(${b.hue}, 100%, 98%, ${alpha * 0.7})`;
  ctx.beginPath();
  ctx.arc(b.x - b.r * 0.35, b.y - b.r * 0.4, b.r * 0.12, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawBreathGuide(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  now: number,
  phaseStart: number,
) {
  const cx = w / 2;
  const cy = h / 2;
  const cycle = 10000;
  const phase = ((now - phaseStart) % cycle) / cycle;
  const inHold = phase < 0.4;
  const t = inHold ? phase / 0.4 : 1 - (phase - 0.4) / 0.6;
  const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const baseR = Math.min(w, h) * 0.06;
  const r = baseR + eased * 70;
  const alpha = 0.18 + 0.22 * eased;

  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  grad.addColorStop(0, `hsla(195, 75%, 75%, ${alpha})`);
  grad.addColorStop(0.6, `hsla(195, 65%, 60%, ${alpha * 0.5})`);
  grad.addColorStop(1, `hsla(195, 55%, 50%, 0)`);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = `hsla(195, 80%, 90%, ${alpha * 0.7})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = `hsla(195, 30%, 30%, ${Math.min(0.7, alpha * 2.2)})`;
  ctx.font = `bold ${Math.round(14 + eased * 4)}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(inHold ? 'inspire' : 'expire', cx, cy);
}

function drawGameOver(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  score: number,
) {
  // Subtle vignette.
  const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${Math.round(Math.min(w, h) * 0.06)}px system-ui, -apple-system, sans-serif`;
  ctx.fillText('Pausa concluída', cx, cy - 20);
  ctx.font = `${Math.round(Math.min(w, h) * 0.035)}px system-ui, -apple-system, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillText(`${score} bolhas libertadas`, cx, cy + 24);
}