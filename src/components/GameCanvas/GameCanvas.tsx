import React, { useRef, useEffect } from 'react';
import { GameState } from '../../types';

interface GameCanvasProps {
  gameState: GameState;
  onCanvasReady: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, onCanvasReady }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const size = gameState.gridSize * gameState.cellSize;
    canvas.width = size;
    canvas.height = size;

    // Notify parent component that canvas is ready
    onCanvasReady(canvas, ctx);
  }, [gameState.gridSize, gameState.cellSize, onCanvasReady]);

  return (
    <div className="flex justify-center items-center flex-1 min-h-[300px]">
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="border-3 border-gray-300 rounded-lg shadow-lg bg-gray-50"
          width={400}
          height={400}
        />
        {/* Execution overlay for animations */}
        <div className="absolute inset-0 pointer-events-none z-10"></div>
      </div>
    </div>
  );
};