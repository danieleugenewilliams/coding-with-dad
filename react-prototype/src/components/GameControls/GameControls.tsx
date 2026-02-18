import React from 'react';

interface GameControlsProps {
  isRunning: boolean;
  onRun: () => void;
  onStep: () => void;
  onReset: () => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
  isRunning,
  onRun,
  onStep,
  onReset
}) => {
  return (
    <div className="flex justify-center gap-3 flex-wrap">
      <button
        onClick={onRun}
        disabled={isRunning}
        className="btn btn-primary btn-large disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="text-xl">▶️</span>
        <span>Run</span>
      </button>

      <button
        onClick={onStep}
        disabled={isRunning}
        className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="text-xl">👣</span>
        <span>Step</span>
      </button>

      <button
        onClick={onReset}
        className="btn btn-secondary"
      >
        <span className="text-xl">🔄</span>
        <span>Reset</span>
      </button>
    </div>
  );
};