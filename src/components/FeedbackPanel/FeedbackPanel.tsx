import React from 'react';
import { Feedback } from '../../types';

interface FeedbackPanelProps {
  feedback: Feedback | null;
  onClear?: () => void;
}

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({ feedback, onClear }) => {
  if (!feedback) {
    return (
      <div className="min-h-[60px] p-4 rounded-lg border-2 border-transparent">
        {/* Empty state */}
      </div>
    );
  }

  const getClassNames = () => {
    const base = "min-h-[60px] p-4 rounded-lg text-center font-medium text-base transition-all duration-300 border-2";

    switch (feedback.type) {
      case 'success':
        return `${base} feedback-success`;
      case 'error':
        return `${base} feedback-error`;
      case 'hint':
        return `${base} feedback-hint`;
      case 'info':
      default:
        return `${base} feedback-info`;
    }
  };

  return (
    <div className={getClassNames()}>
      <div className="flex items-center justify-center gap-2">
        <span>{feedback.message}</span>
        {onClear && (
          <button
            onClick={onClear}
            className="ml-2 text-lg hover:scale-110 transition-transform"
            aria-label="Clear feedback"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};