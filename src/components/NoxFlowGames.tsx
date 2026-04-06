import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, Info, RotateCcw, Hash, Smile, Clock } from 'lucide-react';

interface GameScore {
  name: string;
  score: number;
  date: string;
}

interface NoxFlowGamesProps {
  isBreak: boolean;
}

const GRID_SIZE = 6;
const NUMBERS = ['1', '2', '3', '4', '5'];
const EMOJIS = ['😀', '😎', '🔥', '💎', '⭐'];

export function NoxFlowGames({ isBreak }: NoxFlowGamesProps) {
  const [gameType, setGameType] = useState<'numbers' | 'emojis'>('numbers');
  const [grid, setGrid] = useState<string[][]>([]);
  const [score, setScore] = useState(0);
  const [lastScore, setLastScore] = useState<number>(0);
  const [ranking, setRanking] = useState<GameScore[]>([]);
  const [showInstructions, setShowInstructions] = useState(true);
  const [playerName, setPlayerName] = useState(localStorage.getItem('noxflow_player_name') || '');

  // Load scores from localStorage
  useEffect(() => {
    const savedRanking = localStorage.getItem('noxflow_ranking');
    if (savedRanking) {
      try {
        setRanking(JSON.parse(savedRanking));
      } catch (e) {
        console.error('Error parsing ranking', e);
      }
    }
    const savedLastScore = localStorage.getItem('noxflow_last_score');
    if (savedLastScore) {
      setLastScore(parseInt(savedLastScore));
    }
  }, []);

  const initGrid = useCallback(() => {
    const items = gameType === 'numbers' ? NUMBERS : EMOJIS;
    const newGrid = Array(GRID_SIZE).fill(null).map(() => 
      Array(GRID_SIZE).fill(null).map(() => items[Math.floor(Math.random() * items.length)])
    );
    setGrid(newGrid);
    setScore(0);
  }, [gameType]);

  useEffect(() => {
    initGrid();
  }, [initGrid]);

  const saveScore = (finalScore: number) => {
    setLastScore(finalScore);
    localStorage.setItem('noxflow_last_score', finalScore.toString());

    if (playerName.trim()) {
      const newScore: GameScore = {
        name: playerName,
        score: finalScore,
        date: new Date().toLocaleDateString()
      };
      const newRanking = [...ranking, newScore]
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
      setRanking(newRanking);
      localStorage.setItem('noxflow_ranking', JSON.stringify(newRanking));
      localStorage.setItem('noxflow_player_name', playerName);
    }
  };

  const findConnected = (r: number, c: number, value: string, visited: Set<string>, connected: {r: number, c: number}[]) => {
    const key = `${r},${c}`;
    if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE || visited.has(key) || grid[r][c] !== value) {
      return;
    }
    visited.add(key);
    connected.push({r, c});
    findConnected(r + 1, c, value, visited, connected);
    findConnected(r - 1, c, value, visited, connected);
    findConnected(r, c + 1, value, visited, connected);
    findConnected(r, c - 1, value, visited, connected);
  };

  const handleCellClick = (r: number, c: number) => {
    const value = grid[r][c];
    if (!value) return;

    const connected: {r: number, c: number}[] = [];
    findConnected(r, c, value, new Set(), connected);

    if (connected.length >= 2) {
      const newGrid = grid.map(row => [...row]);
      connected.forEach(({r, c}) => {
        newGrid[r][c] = '';
      });

      // Apply gravity
      for (let col = 0; col < GRID_SIZE; col++) {
        let emptyRow = GRID_SIZE - 1;
        for (let row = GRID_SIZE - 1; row >= 0; row--) {
          if (newGrid[row][col] !== '') {
            const val = newGrid[row][col];
            newGrid[row][col] = '';
            newGrid[emptyRow][col] = val;
            emptyRow--;
          }
        }
      }

      // Refill empty spaces
      const items = gameType === 'numbers' ? NUMBERS : EMOJIS;
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          if (newGrid[row][col] === '') {
            newGrid[row][col] = items[Math.floor(Math.random() * items.length)];
          }
        }
      }

      setGrid(newGrid);
      setScore(prev => prev + (connected.length * 10));
    }
  };

  return (
    <div className="bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[var(--accent-primary)]" />
          Game Center
        </h2>
        <div className="flex items-center gap-2">
          <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider bg-[var(--bg-primary)] px-2 py-1 rounded-md border border-[var(--border-color)]">
            Recorde: {ranking.length > 0 ? ranking[0].score : 0}
          </div>
        </div>
      </div>

      <div key="active-view" className="flex-1 flex flex-col">
        <div className="flex items-center justify-end mb-4">
          <button 
            onClick={() => setShowInstructions(!showInstructions)}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            title="Instruções"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>

        {showInstructions && (
          <div className="bg-[var(--bg-primary)] p-3 rounded-xl text-xs text-[var(--text-secondary)] mb-4 border border-[var(--border-color)]">
            <p className="font-bold mb-1">Como jogar:</p>
            <p>Clique em grupos de 2 ou mais itens iguais para colapsá-los e ganhar pontos. Novos itens cairão do topo!</p>
          </div>
        )}

        <div className="mb-6">
          <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Selecione o Jogo</label>
          <select 
            value={gameType}
            onChange={(e) => { setGameType(e.target.value as 'numbers' | 'emojis'); initGrid(); }}
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm rounded-xl p-3 focus:outline-none focus:border-[var(--accent-primary)] appearance-none cursor-pointer"
          >
            <option value="numbers">🔢 Jogo de Números</option>
            <option value="emojis">😊 Jogo de Emojis</option>
          </select>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="grid grid-cols-6 gap-1 bg-[var(--bg-primary)] p-2 rounded-xl border border-[var(--border-color)]">
            {grid.flat().map((cell, i) => {
              const r = Math.floor(i / GRID_SIZE);
              const c = i % GRID_SIZE;
              return (
                <button
                  key={`cell-${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] rounded-lg text-lg font-bold transition-all border border(--border-color)/50 active:scale-90"
                >
                  {cell}
                </button>
              );
            })}
          </div>

          <div className="mt-6 w-full space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="text-sm font-bold text-[var(--text-primary)]">Score: <span className="text-[var(--accent-primary)]">{score}</span></div>
              <button 
                onClick={() => { saveScore(score); initGrid(); }}
                className="flex items-center gap-1 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <RotateCcw size={14} /> Reiniciar
              </button>
            </div>

            <div className="bg-[var(--bg-primary)] p-4 rounded-xl border border-[var(--border-color)]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Ranking Top 5</span>
                <span className="text-[10px] text-[var(--text-muted)]">Último: {lastScore}</span>
              </div>
              
              <div className="space-y-2">
                {ranking.length === 0 ? (
                  <p className="text-[10px] text-[var(--text-muted)] text-center italic">Nenhum recorde ainda</p>
                ) : (
                  ranking.map((res, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 flex items-center justify-center bg-[var(--bg-surface)] rounded text-[10px] font-bold">{i + 1}</span>
                        <span className="text-[var(--text-primary)] font-medium">{res.name}</span>
                      </div>
                      <span className="font-bold text-[var(--accent-primary)]">{res.score}</span>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-[var(--border-color)]/50">
                <input 
                  type="text" 
                  placeholder="Seu nome para o ranking..."
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-color)] text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--accent-primary)] text-[var(--text-primary)]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
