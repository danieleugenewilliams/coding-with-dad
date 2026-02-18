import React from 'react';
import { Lesson } from '../../types';

interface HeaderProps {
  lesson: Lesson;
  totalLessons: number;
  showCode: boolean;
  onToggleCode: () => void;
  onShowHint: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lesson,
  totalLessons,
  showCode,
  onToggleCode,
  onShowHint
}) => {
  return (
    <header className="bg-white shadow-lg px-5 py-3 z-50">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* App Title */}
        <h1 className="text-2xl font-bold text-gray-800">
          🚀 Coding Adventure
        </h1>

        {/* Lesson Info */}
        <div className="flex flex-col items-center">
          <span className="text-lg font-semibold text-gray-600">
            Lesson {lesson.id}: {lesson.title}
          </span>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full mt-1">
            {lesson.id} of {totalLessons}
          </span>
        </div>

        {/* Header Controls */}
        <div className="flex gap-3">
          <button
            onClick={onToggleCode}
            className={`btn btn-secondary btn-small ${showCode ? 'bg-gray-500' : ''}`}
          >
            {showCode ? 'Hide Code' : 'Show Code'}
          </button>
          <button
            onClick={onShowHint}
            className="btn btn-warning btn-small"
          >
            <span>💡</span>
            Hint
          </button>
        </div>
      </div>
    </header>
  );
};