import React from 'react';
import { Lesson } from '../../types';

interface InstructionsPanelProps {
  lesson: Lesson;
}

export const InstructionsPanel: React.FC<InstructionsPanelProps> = ({ lesson }) => {
  return (
    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary-50 to-primary-100 border-2 border-primary-500 rounded-xl">
      {/* Character Avatar */}
      <div className="text-5xl filter drop-shadow-lg">
        🤖
      </div>

      {/* Instruction Text */}
      <div className="flex-1">
        <h3 className="text-xl font-semibold text-primary-700 mb-1">
          Mission: {lesson.description}
        </h3>
        <p className="text-primary-600">
          Drag movement blocks to help the robot reach its goal!
        </p>
      </div>
    </div>
  );
};